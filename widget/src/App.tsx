import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedbackPayload, ProjectKey, Region } from "@brainbox/shared";
import type { WidgetConfig } from "./lib/config.ts";
import { captureMetadata } from "./lib/metadata.ts";
import { cssPath, elementAt } from "./lib/selector.ts";
import { bakeMarks, captureViewport, pickScreenshot } from "./lib/capture.ts";
import { unionBounds, type Mark } from "./lib/marks.ts";
import { canSessionRecord, startSessionRecording, type SessionRecording } from "./lib/session.ts";
import { clearHighlights } from "./lib/annotate.ts";
import { submitFeedback } from "./lib/submit.ts";
import { Launcher } from "./components/Launcher.tsx";
import { Chooser } from "./components/Chooser.tsx";
import { MarkupOverlay } from "./components/MarkupOverlay.tsx";
import { RecordOverlay } from "./components/RecordOverlay.tsx";
import { Composer } from "./components/Composer.tsx";
import { Result } from "./components/Result.tsx";

const MAX_SESSION_BYTES = 15 * 1024 * 1024;

type Status =
  | "idle"
  | "choosing"
  | "marking"
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
  /** Bumped on every reset. A capture started for an abandoned run can still be
   *  seconds from settling - the markup step is long and Esc is right there -
   *  and without this its `then` would revive a dead run's screenshot and strand
   *  an object URL for a run nobody is looking at any more. */
  const runRef = useRef(0);

  const reset = useCallback(() => {
    runRef.current += 1;
    setShotUrl("");
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

  // The one place object URLs are handed back: whenever `shotUrl` changes - a
  // bake replacing the plain shot, a reset clearing it - and on unmount. Doing
  // it inside a `setShotUrl` updater instead would put a side effect in a
  // function React is free to call more than once.
  useEffect(() => {
    if (!shotUrl) return;
    return () => URL.revokeObjectURL(shotUrl);
  }, [shotUrl]);

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

  /** Enter the markup step and start rasterising immediately.
   *
   *  The capture is kicked off here rather than when the user finishes drawing:
   *  rendering a big page takes seconds, marking one up takes tens of them, so
   *  starting now means the shot is already waiting at Done instead of the user
   *  watching a spinner after it. */
  const startMarkup = useCallback(() => {
    setShotPending(true);
    setShotFailed(false);
    setStatus("marking");

    const run = runRef.current;
    const pending = captureViewport(hostEl);
    shotRef.current = pending;
    pending
      .then((blob) => {
        if (runRef.current !== run) return;
        setShot(blob);
        setShotUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        // A failed screenshot must not sink the report - the text and voice
        // note are still worth filing.
        if (runRef.current === run) setShotFailed(true);
      })
      .finally(() => {
        // Only clears if this is still the shot we intend to send. Leaving the
        // markup step swaps in the bake, and that one is not ready yet - its
        // own `finally` below is what ends the pending state then.
        if (runRef.current === run && shotRef.current === pending) setShotPending(false);
      });
  }, [hostEl]);

  const onMarksDone = useCallback(
    (marks: Mark[]) => {
      // No separate "select the area" step any more - what the user drew *is*
      // the region, so the issue still records where on the page it happened.
      const bounds = unionBounds(marks);
      if (bounds) {
        const cx = bounds.x + bounds.width / 2;
        const cy = bounds.y + bounds.height / 2;
        setRegion({ ...bounds, selector: cssPath(elementAt(cx, cy, hostEl)) });
      }
      setStatus("composing");

      const frozen = shotRef.current;
      if (!frozen || marks.length === 0) return;

      // Flatten in the background: the composer is already up and the user's
      // next move is to start talking. If it fails the plain shot is already
      // attached, so the report still goes out - just without the markup.
      //
      // Pending until it lands, so the composer says "still working" rather than
      // showing the pre-markup shot as if it were final - and so a Send during
      // that window reads as waiting on something rather than as a dead button.
      const run = runRef.current;
      setShotPending(true);
      const baked = frozen.then((blob) => bakeMarks(blob, marks));
      shotRef.current = baked;
      baked
        .then((blob) => {
          if (runRef.current !== run) return;
          setShot(blob);
          setShotUrl(URL.createObjectURL(blob));
        })
        .catch(() => {})
        .finally(() => {
          if (runRef.current === run && shotRef.current === baked) setShotPending(false);
        });
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
      // The capture - and the bake of the user's markup onto it - ran while the
      // user was talking. If they hit Send first, wait for it rather than
      // sending the older, un-marked version sitting in state.
      const screenshot = await pickScreenshot(shotRef.current, shot);
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
          onScreenshot={startMarkup}
          onRecord={startRecord}
          onCancel={reset}
        />
      )}
      {status === "marking" && (
        <MarkupOverlay
          frozenUrl={shotUrl || undefined}
          pending={shotPending}
          failed={shotFailed}
          onDone={onMarksDone}
          onCancel={reset}
        />
      )}
      {status === "recording" && (
        <RecordOverlay
          onStop={() => void finishRecording()}
          micActive={() => recRef.current?.micActive() ?? false}
          onMuteChange={(muted) => recRef.current?.setMicMuted(muted)}
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
