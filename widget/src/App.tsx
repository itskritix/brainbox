import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedbackPayload, ProjectKey, Region } from "@brainbox/shared";
import type { WidgetConfig } from "./lib/config.ts";
import { captureMetadata } from "./lib/metadata.ts";
import { cssPath, elementAt } from "./lib/selector.ts";
import { captureScreenshot, captureViewport } from "./lib/capture.ts";
import { canSessionRecord, startSessionRecording, type SessionRecording } from "./lib/session.ts";
import { clearHighlights } from "./lib/annotate.ts";
import { submitFeedback } from "./lib/submit.ts";
import { Launcher } from "./components/Launcher.tsx";
import { Chooser } from "./components/Chooser.tsx";
import { RegionOverlay } from "./components/RegionOverlay.tsx";
import { RecordOverlay } from "./components/RecordOverlay.tsx";
import { Composer } from "./components/Composer.tsx";
import { Result } from "./components/Result.tsx";

const MAX_SESSION_BYTES = 15 * 1024 * 1024;

type Status =
  | "idle"
  | "choosing"
  | "selecting"
  | "recording"
  | "composing"
  | "submitting"
  | "done"
  | "error";

export function App({ config, hostEl }: { config: WidgetConfig; hostEl: HTMLElement }) {
  const [status, setStatus] = useState<Status>("idle");
  const [region, setRegion] = useState<Region | null>(null);
  const [shot, setShot] = useState<Blob | null>(null);
  const [shotUrl, setShotUrl] = useState("");
  const [session, setSession] = useState<Blob | null>(null);
  const [recAudio, setRecAudio] = useState<Blob | null>(null);
  const [shotPending, setShotPending] = useState(false);
  const [shotFailed, setShotFailed] = useState(false);
  const [error, setError] = useState("");
  const [issueId, setIssueId] = useState("");
  const recRef = useRef<SessionRecording | null>(null);
  /** In-flight screenshot. The composer opens before this settles, so submit
   *  awaits it here rather than blocking the UI on it. */
  const shotRef = useRef<Promise<Blob> | null>(null);

  const reset = useCallback(() => {
    setShotUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
    // an abandoned recording must release the mic + DOM observers
    const rec = recRef.current;
    recRef.current = null;
    if (rec) void rec.stop().catch(() => {});
    clearHighlights();
    shotRef.current = null;
    setStatus("idle");
    setRegion(null);
    setShot(null);
    setSession(null);
    setRecAudio(null);
    setShotPending(false);
    setShotFailed(false);
    setError("");
    setIssueId("");
  }, []);

  // window.Brainbox.open()/close() drive the widget programmatically.
  useEffect(() => {
    const open = () => setStatus((s) => (s === "idle" ? "choosing" : s));
    window.addEventListener("brainbox:open", open);
    window.addEventListener("brainbox:close", reset);
    return () => {
      window.removeEventListener("brainbox:open", open);
      window.removeEventListener("brainbox:close", reset);
    };
  }, [reset]);

  const onRegion = useCallback(
    (rect: Region) => {
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const full: Region = { ...rect, selector: cssPath(elementAt(cx, cy, hostEl)) };
      setRegion(full);

      // Open the composer straight away and rasterise in the background.
      // Rendering a big page can take seconds, and the user's next move is to
      // start talking - there's no reason to make them wait on a thumbnail.
      setShotPending(true);
      setShotFailed(false);
      setStatus("composing");

      const pending = captureScreenshot(full, hostEl);
      shotRef.current = pending;
      pending
        .then((blob) => {
          setShot(blob);
          setShotUrl(URL.createObjectURL(blob));
        })
        .catch(() => {
          // A failed screenshot must not sink the report - the text and voice
          // note are still worth filing.
          setShotFailed(true);
        })
        .finally(() => setShotPending(false));
    },
    [hostEl],
  );

  const finishRecording = useCallback(async () => {
    const rec = recRef.current;
    if (!rec) return;
    recRef.current = null;
    // clear before stop() so the removal lands inside the recording
    clearHighlights();
    try {
      const { session: blob, audio } = await rec.stop();
      if (blob.size > MAX_SESSION_BYTES) {
        setError("Recording too large - try a shorter clip");
        setStatus("error");
        return;
      }
      setSession(blob);
      setRecAudio(audio);
      // last-frame thumbnail: shown in the composer and uploaded as the issue's
      // screenshot so the dashboard list gets a real preview. Best-effort.
      try {
        const thumb = await captureViewport(hostEl);
        setShot(thumb);
        setShotUrl(URL.createObjectURL(thumb));
      } catch {
        /* composer falls back to the text note */
      }
      setStatus("composing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recording failed");
      setStatus("error");
    }
  }, [hostEl]);

  // rrweb DOM recording - starts instantly, no permission prompt, captures only the app.
  const startRecord = useCallback(() => {
    try {
      recRef.current = startSessionRecording(() => void finishRecording());
      setStatus("recording");
    } catch {
      setStatus("choosing");
    }
  }, [finishRecording]);

  const onSubmit = useCallback(
    async (text: string, audio: Blob | null) => {
      setStatus("submitting");
      // The capture ran while the user was talking; if they hit Send first, wait
      // for it now rather than dropping it.
      const pending = shotRef.current;
      const screenshot = shot ?? (pending ? await pending.catch(() => null) : null);
      if (!screenshot && !session && !text.trim() && !audio) {
        setError("Nothing to send - record a note or add a description");
        setStatus("error");
        return;
      }
      const payload: FeedbackPayload = {
        projectKey: config.projectKey as ProjectKey,
        region: region ?? undefined,
        text: text.trim() || undefined,
        metadata: captureMetadata(region?.selector),
      };
      try {
        const id = await submitFeedback({
          endpoint: config.endpoint,
          payload,
          screenshot: screenshot ?? undefined,
          session: session ?? undefined,
          audio: audio ?? recAudio ?? undefined,
        });
        setIssueId(id);
        setStatus("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        setStatus("error");
      }
    },
    [shot, session, recAudio, region, config],
  );

  return (
    <>
      {config.mode === "float" && status === "idle" && (
        <Launcher position={config.position} onClick={() => setStatus("choosing")} />
      )}
      {status === "choosing" && (
        <Chooser
          position={config.position}
          canRecord={canSessionRecord()}
          onScreenshot={() => setStatus("selecting")}
          onRecord={startRecord}
          onCancel={reset}
        />
      )}
      {status === "selecting" && <RegionOverlay onComplete={onRegion} onCancel={reset} />}
      {status === "recording" && (
        <RecordOverlay
          position={config.position}
          onStop={() => void finishRecording()}
          micActive={() => recRef.current?.micActive() ?? false}
        />
      )}
      {status === "composing" && (
        <Composer
          screenshotUrl={shotUrl || undefined}
          sessionReady={!!session}
          voiceCaptured={!!recAudio}
          capturePending={shotPending}
          captureFailed={shotFailed}
          position={config.position}
          onCancel={reset}
          onSubmit={onSubmit}
        />
      )}
      {status === "submitting" && <Result kind="loading" position={config.position} />}
      {status === "done" && (
        <Result kind="success" id={issueId} position={config.position} onClose={reset} />
      )}
      {status === "error" && (
        <Result kind="error" message={error} position={config.position} onClose={reset} />
      )}
    </>
  );
}
