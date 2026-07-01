import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedbackPayload, ProjectKey, Region } from "@brainbox/shared";
import type { WidgetConfig } from "./lib/config.ts";
import { captureMetadata } from "./lib/metadata.ts";
import { cssPath, elementAt } from "./lib/selector.ts";
import { captureScreenshot } from "./lib/capture.ts";
import { canScreenRecord, startScreenRecording, type Recording } from "./lib/record.ts";
import { submitFeedback } from "./lib/submit.ts";
import { Launcher } from "./components/Launcher.tsx";
import { Chooser } from "./components/Chooser.tsx";
import { RegionOverlay } from "./components/RegionOverlay.tsx";
import { RecordOverlay } from "./components/RecordOverlay.tsx";
import { Composer } from "./components/Composer.tsx";
import { Result } from "./components/Result.tsx";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

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
  const [video, setVideo] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [issueId, setIssueId] = useState("");
  const recRef = useRef<Recording | null>(null);

  const reset = useCallback(() => {
    setShotUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
    setVideoUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
    recRef.current = null;
    setStatus("idle");
    setRegion(null);
    setShot(null);
    setVideo(null);
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
    try {
      const blob = await rec.stop();
      if (blob.size === 0) {
        setError("The recording was empty");
        setStatus("error");
        return;
      }
      if (blob.size > MAX_VIDEO_BYTES) {
        setError("Recording too large (max 50 MB) — try a shorter clip");
        setStatus("error");
        return;
      }
      setVideo(blob);
      setVideoUrl(URL.createObjectURL(blob));
      setStatus("composing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recording failed");
      setStatus("error");
    }
  }, []);

  const startRecord = useCallback(async () => {
    try {
      recRef.current = await startScreenRecording(() => void finishRecording());
      setStatus("recording");
    } catch {
      // user dismissed the browser's share picker, or permission was denied
      setStatus("choosing");
    }
  }, [finishRecording]);

  const onSubmit = useCallback(
    async (text: string, audio: Blob | null) => {
      if (!shot && !video) return;
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
          video: video ?? undefined,
          audio: audio ?? undefined,
        });
        setIssueId(id);
        setStatus("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        setStatus("error");
      }
    },
    [shot, video, region, config],
  );

  return (
    <>
      {config.mode === "float" && status === "idle" && (
        <Launcher position={config.position} onClick={() => setStatus("choosing")} />
      )}
      {status === "choosing" && (
        <Chooser
          position={config.position}
          canRecord={canScreenRecord()}
          onScreenshot={() => setStatus("selecting")}
          onRecord={() => void startRecord()}
          onCancel={reset}
        />
      )}
      {status === "selecting" && <RegionOverlay onComplete={onRegion} onCancel={reset} />}
      {status === "recording" && (
        <RecordOverlay position={config.position} onStop={() => void finishRecording()} />
      )}
      {status === "composing" && (shotUrl || videoUrl) && (
        <Composer
          screenshotUrl={shotUrl || undefined}
          videoUrl={videoUrl || undefined}
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
