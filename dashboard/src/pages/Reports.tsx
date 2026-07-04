import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Mic, Play, Video } from "lucide-react";
import type { Issue } from "@brainbox/shared";

import { EmptyState } from "../components/EmptyState";
import { InstallSnippet } from "../components/InstallSnippet";
import { Skeleton } from "../components/ui/skeleton";
import { api } from "../lib/api";
import { issueTitle } from "../lib/issue";
import { useProject } from "../lib/useProject";
import { cn, timeAgo } from "../lib/utils";

const FILTERS = [
  { key: "all", label: "All", match: () => true },
  { key: "replay", label: "Replays", match: (i: Issue) => Boolean(i.session) },
  { key: "video", label: "Recordings", match: (i: Issue) => Boolean(i.video) },
  { key: "errors", label: "With errors", match: (i: Issue) => i.metadata.consoleErrors.length > 0 },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function ReportCard({ issue, to }: { issue: Issue; to: string }) {
  const thumb = issue.crop?.url ?? issue.screenshot?.url;
  const errorCount = issue.metadata.consoleErrors.length;
  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-xl border border-default bg-elevated transition hover:border-interactive hover:bg-interactive-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-default bg-subtle">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
          />
        ) : issue.video?.url ? (
          // no stored poster — let the browser paint the first video frame
          <video
            src={`${issue.video.url}#t=0.1`}
            preload="metadata"
            muted
            playsInline
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted">
            <Video className="h-6 w-6" />
          </span>
        )}
        {(issue.session ?? issue.video) && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black-a9 text-white backdrop-blur-sm transition group-hover:scale-105">
              <Play className="h-4 w-4" />
            </span>
          </span>
        )}
        {errorCount > 0 && (
          <span className="absolute right-2 top-2 rounded-full border border-error-subtle bg-error px-2 py-0.5 font-mono text-[11px] text-error backdrop-blur-sm">
            {errorCount} {errorCount === 1 ? "error" : "errors"}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm text-emphasis">{issueTitle(issue)}</p>
        <div className="mt-1.5 flex items-center gap-2.5 font-mono text-[11px] text-muted">
          <span>{timeAgo(issue.createdAt)}</span>
          {issue.session && <Play className="h-3 w-3" aria-label="Session replay" />}
          {issue.video && <Video className="h-3 w-3" aria-label="Screen recording" />}
          {issue.audio && <Mic className="h-3 w-3" aria-label="Voice note" />}
        </div>
      </div>
    </Link>
  );
}

export function Reports() {
  const { project } = useProject();
  const [filter, setFilter] = useState<FilterKey>("all");
  // keyed by project so switching projects reads as loading, not stale data
  const [result, setResult] = useState<{
    projectId: string;
    issues?: Issue[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listIssues(project.id)
      .then((issues) => {
        if (!cancelled) setResult({ projectId: project.id, issues });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ projectId: project.id, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [project.id]);

  const current = result?.projectId === project.id ? result : null;
  const issues = current?.issues ?? null;
  const error = current?.error ?? null;

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  // First-run: the snippet lives where the first report will land.
  if (issues && issues.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 py-16">
        <div className="w-full max-w-lg">
          <EmptyState icon={<Camera />} title="Waiting for the first report" breathe>
            <p className="mt-1 text-sm text-muted">
              Paste this into your app, just before <code className="font-mono">&lt;/body&gt;</code>.
              Reports land here as end-users send them.
            </p>
          </EmptyState>
          <div className="mt-6">
            <InstallSnippet projectKey={project.key} />
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            Lock reporting to your own domains in{" "}
            <Link to={`/projects/${project.id}/settings`} className="text-link hover:underline">
              Settings
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible = issues?.filter(active.match) ?? null;

  return (
    <div className="min-h-0 flex-1 lg:overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-emphasis">Reports</h1>
            <span className="font-mono text-xs text-muted">
              {issues ? issues.length : "…"}
            </span>
          </div>
          {issues && issues.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => {
                const count = issues.filter(f.match).length;
                if (f.key !== "all" && count === 0) return null;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs transition",
                      filter === f.key
                        ? "bg-interactive text-emphasis"
                        : "text-muted hover:bg-interactive-hover hover:text-emphasis",
                    )}
                  >
                    {f.label} <span className="font-mono">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 pb-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible
            ? visible.map((issue) => (
                <ReportCard
                  key={issue.id}
                  issue={issue}
                  to={`/projects/${project.id}/issues/${issue.id}`}
                />
              ))
            : Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-default">
                  <Skeleton className="aspect-[16/10] rounded-none" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                  </div>
                </div>
              ))}
        </div>

        {visible && visible.length === 0 && (
          <p className="pb-10 text-center text-sm text-muted">
            No {active.label.toLowerCase()} in this project yet.
          </p>
        )}
      </div>
    </div>
  );
}
