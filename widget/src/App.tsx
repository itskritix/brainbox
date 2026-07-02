import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedbackPayload, ProjectKey, Region } from "@brainbox/shared";
import type { WidgetConfig } from "./lib/config.ts";
import { captureMetadata } from "./lib/metadata.ts";
import { cssPath, elementAt } from "./lib/selector.ts";
import { captureScreenshot } from "./lib/capture.ts";
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
  | "capturing"
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
  const [error, setError] = useState("");
  const [issueId, setIssueId] = useState("");
  const recRef = useRef<SessionRecording | null>(null);

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
    setStatus("idle");
    setRegion(null);
    setShot(null);
    setSession(null);
    setRecAudio(null);
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
    async (rect: Region) => {
      setStatus("capturing");
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const full: Region = { ...rect, selector: cssPath(elementAt(cx, cy, hostEl)) };
      setRegion(full);
      try {
        const blob = await captureScreenshot(full, hostEl);
        setShot(blob);
        setShotUrl(URL.createObjectURL(blob));
        setStatus("composing");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Screenshot failed");
        setStatus("error");
      }
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
        setError("Recording too large — try a shorter clip");
        setStatus("error");
        return;
      }
      setSession(blob);
      setRecAudio(audio);
      setStatus("composing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recording failed");
      setStatus("error");
    }
  }, []);

  // rrweb DOM recording — starts instantly, no permission prompt, captures only the app.
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
      if (!shot && !session) return;
      setStatus("submitting");
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
          screenshot: shot ?? undefined,
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
      {status === "composing" && (shotUrl || session) && (
        <Composer
          screenshotUrl={shotUrl || undefined}
          sessionReady={!!session}
          voiceCaptured={!!recAudio}
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
