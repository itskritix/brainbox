import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Inbox as InboxIcon, Mic, MousePointerClick, Play, Video } from "lucide-react";
import type { Issue } from "@brainbox/shared";

import { EmptyState } from "../components/EmptyState";
import { Eyebrow } from "../components/Eyebrow";
import { InstallSnippet } from "../components/InstallSnippet";
import { IssueDetailPane } from "../components/IssueDetailPane";
import { Skeleton } from "../components/ui/skeleton";
import { api } from "../lib/api";
import { issueTitle } from "../lib/issue";
import { useProject } from "../lib/useProject";
import { cn, timeAgo } from "../lib/utils";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-default bg-subtle px-1 py-0.5 font-mono text-[10px] text-default">
      {children}
    </kbd>
  );
}

function IssueRow({ issue, to, selected }: { issue: Issue; to: string; selected: boolean }) {
  const thumb = issue.crop?.url ?? issue.screenshot?.url;
  const errorCount = issue.metadata.consoleErrors.length;
  return (
    <li>
      <Link
        to={to}
        aria-current={selected ? "page" : undefined}
        className={cn(
          "flex gap-3 border-b border-subtle px-4 py-3 transition",
          selected ? "bg-interactive" : "hover:bg-interactive-hover",
        )}
      >
        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-default bg-subtle">
          {thumb ? (
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-muted">
              <Video className="h-4 w-4" />
            </span>
          )}
          {issue.session && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-black-a9 text-white backdrop-blur-sm">
                <Play className="h-2.5 w-2.5" />
              </span>
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm", selected ? "text-emphasis" : "text-default")}>
            {issueTitle(issue)}
          </p>
          <div className="mt-1.5 flex items-center gap-2.5 font-mono text-[11px] text-muted">
            <span>{timeAgo(issue.createdAt)}</span>
            {issue.session && <Play className="h-3 w-3" aria-label="Has session replay" />}
            {issue.video && <Video className="h-3 w-3" aria-label="Has screen recording" />}
            {issue.audio && <Mic className="h-3 w-3" aria-label="Has voice note" />}
            {errorCount > 0 && (
              <span className="text-error">
                {errorCount} {errorCount === 1 ? "error" : "errors"}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

export function Inbox() {
  const { project } = useProject();
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
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

  // j/k triage: move the selection down/up the queue
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "j" && e.key !== "k") return;
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      ) {
        return;
      }
      if (!issues || issues.length === 0) return;
      const idx = issues.findIndex((i) => i.id === issueId);
      const nextIdx =
        e.key === "j" ? Math.min(idx + 1, issues.length - 1) : Math.max(idx - 1, 0);
      const next = issues[nextIdx];
      if (next && next.id !== issueId) {
        navigate(`/projects/${project.id}/issues/${next.id}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [issues, issueId, navigate, project.id]);

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
          <EmptyState icon={<InboxIcon />} title="Waiting for the first report" breathe>
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

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <section
        className={cn(
          "min-h-0 flex-col border-default lg:flex lg:w-[380px] lg:shrink-0 lg:border-r",
          issueId ? "hidden lg:flex" : "flex",
        )}
      >
        <header className="flex items-baseline justify-between border-b border-default px-4 py-3">
          <Eyebrow>Inbox</Eyebrow>
          <span className="font-mono text-xs text-muted">
            {issues ? `${issues.length} ${issues.length === 1 ? "report" : "reports"}` : "…"}
          </span>
        </header>
        <ul className="min-h-0 flex-1 lg:overflow-y-auto">
          {issues
            ? issues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  to={`/projects/${project.id}/issues/${issue.id}`}
                  selected={issue.id === issueId}
                />
              ))
            : Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex gap-3 border-b border-subtle px-4 py-3">
                  <Skeleton className="h-11 w-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                  </div>
                </li>
              ))}
        </ul>
      </section>

      <section
        className={cn(
          "min-h-0 flex-1 flex-col lg:flex lg:overflow-y-auto",
          issueId ? "flex" : "hidden lg:flex",
        )}
      >
        {issueId ? (
          // keyed so each report starts from its own loading state
          <IssueDetailPane key={issueId} issueId={issueId} projectId={project.id} />
        ) : (
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <EmptyState icon={<MousePointerClick />} title="Select a report">
              <p className="mt-2 font-mono text-xs text-muted">
                <Kbd>j</Kbd> / <Kbd>k</Kbd> to move through the queue
              </p>
            </EmptyState>
          </div>
        )}
      </section>
    </div>
  );
}
