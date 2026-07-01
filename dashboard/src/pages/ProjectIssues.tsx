import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Video } from "lucide-react";
import type { Issue, Project } from "@brainbox/shared";

import { api } from "../lib/api";

export function ProjectIssues() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getProject(id).then(setProject).catch((e: Error) => setError(e.message));
    api.listIssues(id).then(setIssues).catch((e: Error) => setError(e.message));
  }, [id]);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-default px-6 py-4">
        <Link to="/" className="text-xs text-muted hover:text-link">
          ← Projects
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-emphasis">
          {project?.name ?? "Issues"}
        </h1>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {error && <p className="text-sm text-error">{error}</p>}
        <ul className="space-y-3">
          {issues.map((issue) => (
            <li key={issue.id}>
              <Link
                to={`/issues/${issue.id}`}
                className="border-sheen flex gap-4 rounded-2xl bg-elevated p-4 hover:bg-interactive-hover"
              >
                {issue.crop?.url ?? issue.screenshot?.url ? (
                  <img
                    src={issue.crop?.url ?? issue.screenshot?.url}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-lg border border-default object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-default bg-subtle text-muted">
                    <Video className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm text-emphasis">
                    {issue.text || issue.metadata.url}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {new Date(issue.createdAt).toLocaleString()}
                    {issue.session ? " · ▶ recording" : ""}
                    {issue.video ? " · 🎥 recording" : ""}
                    {issue.audio ? " · 🎙 audio" : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
          {issues.length === 0 && !error && (
            <li className="text-sm text-muted">No feedback yet for this project.</li>
          )}
        </ul>
      </main>
    </div>
  );
}
