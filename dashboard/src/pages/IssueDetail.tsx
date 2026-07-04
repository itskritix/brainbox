import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, Pause, Play, X, ZoomIn } from "lucide-react";
import type { Issue } from "@brainbox/shared";
import type { Replayer } from "@rrweb/replay";
import "@rrweb/replay/dist/style.css";

import { api } from "../lib/api";

type ReplayerEvents = ConstructorParameters<typeof Replayer>[0];

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// rrweb-player's shipped dist is broken (its Player never constructs a Replayer),
// so we drive @rrweb/replay directly with our own play/seek controls.
function SessionReplay({ url, vw, vh }: { url: string; vw: number; vh: number }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<Replayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const el = frameRef.current;
    if (!el) return;

    // fit the frame to the recorded viewport's aspect ratio
    const width = el.clientWidth || 640;
    el.style.height = `${Math.min(560, Math.max(240, Math.round(width * (vh / Math.max(vw, 1)))))}px`;

    (async () => {
      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Session fetch failed (${res.status})`);
        const buf = await res.arrayBuffer();
        let text: string;
        if (url.endsWith(".gz") && typeof DecompressionStream !== "undefined") {
          const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
          text = await new Response(ds).text();
        } else {
          text = new TextDecoder().decode(buf);
        }
        const parsed = JSON.parse(text) as { events?: unknown[] };
        const events = parsed.events ?? [];
        if (cancelled) return;
        if (events.length < 2) {
          setError("Recording too short to replay");
          return;
        }

        const { Replayer: ReplayerCtor } = await import("@rrweb/replay");
        if (cancelled) return;
        const replayer = new ReplayerCtor(events as ReplayerEvents, {
          root: el,
          skipInactive: true,
          showWarning: false,
        });
        replayerRef.current = replayer;
        setTotal(replayer.getMetaData().totalTime);
        replayer.pause(0); // render the first frame

        const applyScale = () => {
          const { wrapper, iframe } = replayer;
          const fw = iframe.offsetWidth || vw;
          const fh = iframe.offsetHeight || vh;
          const scale = Math.min(
            el.clientWidth / Math.max(fw, 1),
            el.clientHeight / Math.max(fh, 1),
          );
          wrapper.style.position = "absolute";
          wrapper.style.left = "50%";
          wrapper.style.top = "50%";
          wrapper.style.transformOrigin = "0 0";
          wrapper.style.transform = `scale(${scale}) translate(-50%, -50%)`;
        };
        applyScale();
        replayer.on("resize", applyScale);
        replayer.on("finish", () => setPlaying(false));
        window.addEventListener("resize", applyScale);
        cleanup = () => window.removeEventListener("resize", applyScale);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load recording");
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
      try {
        replayerRef.current?.pause();
      } catch {
        /* replayer may never have initialized */
      }
      replayerRef.current = null;
      el.innerHTML = "";
      setPlaying(false);
      setTime(0);
    };
  }, [url, vw, vh]);

  // progress clock while playing
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const r = replayerRef.current;
      if (r) setTime(Math.min(r.getCurrentTime(), r.getMetaData().totalTime));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const toggle = useCallback(() => {
    const r = replayerRef.current;
    if (!r) return;
    if (playing) {
      r.pause();
      setTime(r.getCurrentTime());
      setPlaying(false);
    } else {
      r.play(time >= total ? 0 : time);
      setPlaying(true);
    }
  }, [playing, time, total]);

  const seek = useCallback(
    (ms: number) => {
      const r = replayerRef.current;
      if (!r) return;
      setTime(ms);
      if (playing) r.play(ms);
      else r.pause(ms);
    },
    [playing],
  );

  return (
    <figure className="space-y-2">
      <figcaption className="px-1 text-xs font-medium text-muted">Session recording</figcaption>
      {error ? (
        <p className="rounded-lg border border-default bg-elevated p-3 text-xs text-error">{error}</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-default bg-elevated">
          <div ref={frameRef} className="relative w-full overflow-hidden bg-subtle" />
          <div className="flex items-center gap-3 border-t border-default px-3 py-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="rounded-full bg-brand p-2 text-on-brand hover:bg-brand-hover"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={Math.max(total, 1)}
              value={Math.min(time, total)}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full"
            />
            <span className="shrink-0 font-mono text-xs text-muted">
              {fmtClock(time)} / {fmtClock(total)}
            </span>
          </div>
        </div>
      )}
    </figure>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-default py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="truncate text-default">{value}</span>
    </div>
  );
}

function Shot({ label, url, onZoom }: { label: string; url: string; onZoom: (u: string) => void }) {
  return (
    <figure className="space-y-2">
      <figcaption className="px-1 text-xs font-medium text-muted">{label}</figcaption>
      <button
        type="button"
        onClick={() => onZoom(url)}
        className="group relative block w-full overflow-hidden rounded-2xl border border-default"
      >
        <img
          src={url}
          alt={label}
          className="w-full cursor-zoom-in transition group-hover:opacity-95"
        />
        <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" /> Click to enlarge
        </span>
      </button>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 px-1 text-xs text-muted hover:text-link"
      >
        <ExternalLink className="h-3.5 w-3.5" /> Open original
      </a>
    </figure>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Full size"
        className="max-h-full max-w-full rounded-lg border border-default object-contain shadow-3xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full border border-default bg-elevated p-2 text-muted transition hover:text-emphasis"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getIssue(id).then(setIssue).catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) {
    return <div className="min-h-dvh bg-background p-6 text-sm text-error">{error}</div>;
  }
  if (!issue) {
    return <div className="min-h-dvh bg-background p-6 text-sm text-muted">Loading…</div>;
  }

  const m = issue.metadata;
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-default px-6 py-4">
        <Link to={`/projects/${issue.projectId}`} className="text-xs text-muted hover:text-link">
          ← Issues
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-emphasis">Feedback</h1>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[minmax(0,1.6fr)_1fr]">
        <div className="space-y-6">
          {issue.session?.url && (
            <SessionReplay url={issue.session.url} vw={m.viewport.width} vh={m.viewport.height} />
          )}
          {issue.video?.url && (
            <figure className="space-y-2">
              <figcaption className="px-1 text-xs font-medium text-muted">Screen recording</figcaption>
              <video
                controls
                src={issue.video.url}
                className="w-full rounded-2xl border border-default"
              />
            </figure>
          )}
          {issue.crop?.url && (
            <Shot label="Highlighted area" url={issue.crop.url} onZoom={setZoomUrl} />
          )}
          {issue.screenshot?.url && (
            <Shot
              label={issue.session ? "Last frame" : "Full screenshot"}
              url={issue.screenshot.url}
              onZoom={setZoomUrl}
            />
          )}
          {issue.text && (
            <p className="rounded-2xl bg-elevated p-4 text-sm text-default">{issue.text}</p>
          )}
          {issue.audio && (
            <audio controls src={issue.audio.url} className="w-full">
              <track kind="captions" />
            </audio>
          )}
        </div>

        <aside className="space-y-1">
          <Meta label="When" value={new Date(issue.createdAt).toLocaleString()} />
          <Meta label="URL" value={m.url} />
          <Meta label="Title" value={m.title} />
          <Meta label="Viewport" value={`${m.viewport.width}×${m.viewport.height} @${m.devicePixelRatio}x`} />
          <Meta label="Language" value={m.language} />
          <Meta label="Timezone" value={m.timezone} />
          {m.selector && <Meta label="Selector" value={m.selector} />}
          {m.identity?.email && <Meta label="User" value={m.identity.email} />}
          <Meta label="User agent" value={m.userAgent} />
          {m.consoleErrors.length > 0 && (
            <div className="pt-3">
              <p className="text-xs font-medium text-muted">Console errors</p>
              <ul className="mt-1 space-y-1">
                {m.consoleErrors.map((err, i) => (
                  <li key={i} className="font-mono text-xs text-error">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </main>

      {zoomUrl && <Lightbox src={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </div>
  );
}
