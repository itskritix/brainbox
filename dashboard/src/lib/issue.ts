import type { Issue } from "@brainbox/shared";

/** One-line label for a report: the end-user's note if they wrote one, else
 *  the page's document title. The bare host+path is a last resort - inside a
 *  project the domain is constant context, not a title. */
export function issueTitle(issue: Pick<Issue, "text" | "metadata">): string {
  const text = issue.text?.trim();
  if (text) return text;
  return issue.metadata.title || pageLabel(issue.metadata.url) || "Untitled report";
}

/** Newest first by createdAt (ISO strings compare lexically). Needed when
 *  merging per-project lists in the all-projects view. */
export function newestFirst<T extends Pick<Issue, "createdAt">>(issues: T[]): T[] {
  return [...issues].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Case-insensitive search across everything a row shows: the title/note,
 *  the page, and the reporter. An empty query matches everything. */
export function matchesIssue(issue: Pick<Issue, "text" | "metadata">, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    issueTitle(issue),
    pageLabel(issue.metadata.url),
    issue.metadata.identity?.email ?? "",
  ]
    .join("\n")
    .toLowerCase();
  return haystack.includes(q);
}

/** "app.example.com/settings" from a full URL; returns the input if unparseable. */
export function pageLabel(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return url;
  }
}

/** Just the path ("/settings") - the part that varies inside one project,
 *  where the domain is constant context. Empty for the root page or an
 *  unparseable URL. */
export function pagePath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? "" : u.pathname;
  } catch {
    return "";
  }
}

/** 83000 → "1:23" */
export function formatClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
