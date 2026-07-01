import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, X, ZoomIn } from "lucide-react";
import type { Issue } from "@brainbox/shared";

import { api } from "../lib/api";

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
          {issue.crop?.url && (
            <Shot label="Highlighted area" url={issue.crop.url} onZoom={setZoomUrl} />
          )}
          {issue.screenshot.url && (
            <Shot label="Full screenshot" url={issue.screenshot.url} onZoom={setZoomUrl} />
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
