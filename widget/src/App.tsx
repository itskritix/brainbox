import { useCallback, useEffect, useState } from "react";
import type { FeedbackPayload, ProjectKey, Region } from "@brainbox/shared";
import type { WidgetConfig } from "./lib/config.ts";
import { captureMetadata } from "./lib/metadata.ts";
import { cssPath, elementAt } from "./lib/selector.ts";
import { captureScreenshot } from "./lib/capture.ts";
import { submitFeedback } from "./lib/submit.ts";
import { Launcher } from "./components/Launcher.tsx";
import { RegionOverlay } from "./components/RegionOverlay.tsx";
import { Composer } from "./components/Composer.tsx";
import { Result } from "./components/Result.tsx";

type Status = "idle" | "selecting" | "capturing" | "composing" | "submitting" | "done" | "error";

export function App({ config, hostEl }: { config: WidgetConfig; hostEl: HTMLElement }) {
  const [status, setStatus] = useState<Status>("idle");
  const [region, setRegion] = useState<Region | null>(null);
  const [shot, setShot] = useState<Blob | null>(null);
  const [shotUrl, setShotUrl] = useState("");
  const [error, setError] = useState("");
  const [issueId, setIssueId] = useState("");

  const reset = useCallback(() => {
    setShotUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
    setStatus("idle");
    setRegion(null);
    setShot(null);
    setError("");
    setIssueId("");
  }, []);

  // window.Brainbox.open()/close() drive the widget programmatically.
  useEffect(() => {
    const open = () => setStatus((s) => (s === "idle" ? "selecting" : s));
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

  const onSubmit = useCallback(
    async (text: string, audio: Blob | null) => {
      if (!shot || !region) return;
      setStatus("submitting");
      const payload: FeedbackPayload = {
        projectKey: config.projectKey as ProjectKey,
        region,
        text: text.trim() || undefined,
        metadata: captureMetadata(region.selector),
      };
      try {
        const id = await submitFeedback({
          endpoint: config.endpoint,
          payload,
          screenshot: shot,
          audio: audio ?? undefined,
        });
        setIssueId(id);
        setStatus("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        setStatus("error");
      }
    },
    [shot, region, config],
  );

  return (
    <>
      {config.mode === "float" && status === "idle" && (
        <Launcher position={config.position} onClick={() => setStatus("selecting")} />
      )}
      {status === "selecting" && <RegionOverlay onComplete={onRegion} onCancel={reset} />}
      {status === "composing" && shotUrl && (
        <Composer
          screenshotUrl={shotUrl}
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
