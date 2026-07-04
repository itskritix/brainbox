import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mic, Play, Video } from "lucide-react";
import type { Issue, Project } from "@brainbox/shared";

import { ProjectTabs } from "../components/ProjectTabs";
import { Shell } from "../components/Shell";
import { api } from "../lib/api";
import { timeAgo } from "../lib/utils";

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-default px-2 py-0.5 text-[11px] text-muted">
      {icon}
      {label}
    </span>
  );
}

export function ProjectIssues() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getProject(id).then(setProject).catch((e: Error) => setError(e.message));
    api.listIssues(id).then(setIssues).catch((e: Error) => setError(e.message));
  }, [id]);

  return (
    <Shell crumbs={[{ label: "Projects", to: "/" }, { label: project?.name ?? "…" }]}>
      <h1 className="text-xl font-semibold tracking-tight text-emphasis">
        {project?.name ?? "Feedback"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {issues ? `${issues.length} ${issues.length === 1 ? "report" : "reports"}` : "Loading…"}
      </p>
      {id && <ProjectTabs projectId={id} />}

      {error && <p className="mt-6 text-sm text-error">{error}</p>}

      <ul className="mt-6 space-y-3 pb-4">
        {issues?.map((issue) => (
          <li key={issue.id}>
            <Link
              to={`/issues/${issue.id}`}
              className="border-sheen flex gap-4 rounded-2xl bg-elevated p-4 transition hover:bg-interactive-hover"
            >
              {issue.crop?.url ?? issue.screenshot?.url ? (
                <div className="relative shrink-0">
                  <img
                    src={issue.crop?.url ?? issue.screenshot?.url}
                    alt=""
                    className="h-16 w-24 rounded-lg border border-default object-cover"
                  />
                  {issue.session && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-black/60 backdrop-blur-sm">
                        <Play className="h-3 w-3 text-white" />
                      </span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="grid h-16 w-24 shrink-0 place-items-center rounded-lg border border-default bg-subtle text-muted">
                  <Video className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-emphasis">
                  {issue.text || issue.metadata.url}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted">
                    {timeAgo(issue.createdAt)}
                  </span>
                  {issue.session && (
                    <Badge icon={<Play className="h-2.5 w-2.5" />} label="Replay" />
                  )}
                  {issue.video && (
                    <Badge icon={<Video className="h-2.5 w-2.5" />} label="Video" />
                  )}
                  {issue.audio && (
                    <Badge icon={<Mic className="h-2.5 w-2.5" />} label="Voice" />
                  )}
                  {issue.metadata.consoleErrors.length > 0 && (
                    <span className="rounded-full border border-default px-2 py-0.5 font-mono text-[11px] text-error">
                      {issue.metadata.consoleErrors.length} console{" "}
                      {issue.metadata.consoleErrors.length === 1 ? "error" : "errors"}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
        {issues?.length === 0 && !error && (
          <li className="border-sheen rounded-2xl bg-elevated p-10 text-center">
            <p className="text-sm text-default">No feedback yet.</p>
            <p className="mt-1 text-sm text-muted">
              Install the widget on your site and reports land here the moment someone
              sends one.{" "}
              <Link to="/" className="text-link hover:underline">
                Get the snippet
              </Link>
            </p>
          </li>
        )}
      </ul>
    </Shell>
  );
}
