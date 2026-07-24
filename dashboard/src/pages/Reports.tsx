import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Mic, Play, Search, Video } from "lucide-react";
import type { Issue } from "@brainbox/shared";

import { EmptyState } from "../components/EmptyState";
import { InstallSnippet } from "../components/InstallSnippet";
import { Skeleton } from "../components/ui/skeleton";
import { api } from "../lib/api";
import { issueTitle, matchesIssue, pageLabel } from "../lib/issue";
import { useProject } from "../lib/useProject";
import { cn, isToday, timeAgo } from "../lib/utils";

const FILTERS = [
  { key: "all", label: "All", match: () => true },
  { key: "replay", label: "Replays", match: (i: Issue) => Boolean(i.session) },
  { key: "video", label: "Recordings", match: (i: Issue) => Boolean(i.video) },
  { key: "errors", label: "With errors", match: (i: Issue) => i.metadata.consoleErrors.length > 0 },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

/** Evidence readout: what the report captured, as a mono chip. */
function Chip({ error, children }: { error?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-1 font-mono text-[11px] leading-none",
        error
          ? "border-error-subtle bg-error text-error"
          : "border-interactive bg-interactive text-default",
      )}
    >
      {children}
    </span>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-6 px-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted first:mt-0">
      {children}
    </div>
  );
}

function ReportRow({ issue, to }: { issue: Issue; to: string }) {
  const errorCount = issue.metadata.consoleErrors.length;
  // issueTitle already falls back to the page when there's no note - only
  // repeat the page (and reporter) on the meta line when they add information.
  const hasNote = Boolean(issue.text?.trim());
  const reporter = issue.metadata.identity?.email;
  const meta = [...(hasNote ? [pageLabel(issue.metadata.url)] : []), ...(reporter ? [reporter] : [])];
  const thumb = issue.crop?.url ?? issue.screenshot?.url;
  return (
    <Link
      to={to}
      className="group flex items-center gap-3.5 px-4 py-2.5 transition hover:bg-interactive-hover"
    >
      <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-interactive bg-subtle">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
        ) : issue.video?.url ? (
          // no stored poster - let the browser paint the first video frame
          <video
            src={`${issue.video.url}#t=0.1`}
            preload="metadata"
            muted
            playsInline
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none h-full w-full object-cover object-top"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted">
            <Video className="h-4 w-4" />
          </span>
        )}
        {(issue.session ?? issue.video) && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-6 place-items-center rounded-full bg-black-a9 text-white transition group-hover:scale-105">
              <Play className="h-3 w-3" />
            </span>
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="truncate text-sm text-emphasis">{issueTitle(issue)}</span>
        {meta.length > 0 && (
          <span className="hidden min-w-0 truncate text-xs text-muted sm:block">
            {meta.join(" · ")}
          </span>
        )}
      </span>
      <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
        {issue.session && (
          <Chip>
            <Play className="h-2.5 w-2.5" aria-hidden />
            replay
          </Chip>
        )}
        {issue.video && (
          <Chip>
            <Video className="h-2.5 w-2.5" aria-hidden />
            rec
          </Chip>
        )}
        {issue.audio && (
          <Chip>
            <Mic className="h-2.5 w-2.5" aria-hidden />
            voice
          </Chip>
        )}
      </span>
      {errorCount > 0 && (
        <Chip error>
          {errorCount} {errorCount === 1 ? "error" : "errors"}
        </Chip>
      )}
      <span className="w-14 shrink-0 text-right font-mono text-[11px] text-muted">
        {timeAgo(issue.createdAt)}
      </span>
    </Link>
  );
}

function ReportList({ issues, projectId }: { issues: Issue[]; projectId: string }) {
  return (
    <ul className="overflow-hidden rounded-xl border border-default bg-elevated">
      {issues.map((issue) => (
        <li key={issue.id} className="border-t border-default first:border-t-0">
          <ReportRow issue={issue} to={`/projects/${projectId}/issues/${issue.id}`} />
        </li>
      ))}
    </ul>
  );
}

export function Reports() {
  const { project } = useProject();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
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
  const visible = issues?.filter(active.match).filter((i) => matchesIssue(i, query)) ?? null;
  const today = visible?.filter((i) => isToday(i.createdAt)) ?? [];
  const earlier = visible?.filter((i) => !isToday(i.createdAt)) ?? [];
  // group headers only when they separate something
  const grouped = today.length > 0 && earlier.length > 0;

  return (
    <div className="min-h-0 flex-1 lg:overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-emphasis">Reports</h1>
            <span className="font-mono text-xs text-muted">
              {issues ? issues.length : "…"}
            </span>
          </div>
          {issues && issues.length > 0 && (
            <label className="flex min-w-40 flex-1 items-center gap-2 rounded-lg border border-interactive bg-interactive px-2.5 py-1.5 text-muted transition focus-within:ring-[3px] focus-within:ring-focus sm:max-w-xs">
              <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, reporter, or page…"
                aria-label="Search reports"
                className="w-full min-w-0 bg-transparent text-sm text-emphasis outline-none placeholder:text-placeholder"
              />
            </label>
          )}
          {issues && issues.length > 0 && (
            <div className="ml-auto flex flex-wrap gap-1">
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

        <div className="mt-6 pb-6">
          {!visible && (
            <ul className="overflow-hidden rounded-xl border border-default bg-elevated">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="border-t border-default first:border-t-0">
                  <div className="flex items-center gap-3.5 px-4 py-2.5">
                    <Skeleton className="h-14 w-24 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {visible && visible.length > 0 && !grouped && (
            <ReportList issues={visible} projectId={project.id} />
          )}
          {visible && grouped && (
            <>
              <GroupLabel>Today</GroupLabel>
              <ReportList issues={today} projectId={project.id} />
              <GroupLabel>Earlier</GroupLabel>
              <ReportList issues={earlier} projectId={project.id} />
            </>
          )}
          {visible && visible.length === 0 && (
            <p className="pb-4 pt-10 text-center text-sm text-muted">
              {query.trim()
                ? `No reports match "${query.trim()}".`
                : `No ${active.label.toLowerCase()} in this project yet.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
