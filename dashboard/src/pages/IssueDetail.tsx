import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

export function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-8 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <img
            src={issue.screenshot.url}
            alt="screenshot"
            className="w-full rounded-2xl border border-default"
          />
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
    </div>
  );
}
