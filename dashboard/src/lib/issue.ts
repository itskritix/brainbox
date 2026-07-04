import type { Issue } from "@brainbox/shared";

/** One-line label for a report: the end-user's note if they wrote one,
 *  else the page it came from. */
export function issueTitle(issue: Pick<Issue, "text" | "metadata">): string {
  const text = issue.text?.trim();
  if (text) return text;
  return pageLabel(issue.metadata.url) || issue.metadata.title || "Untitled report";
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

/** 83000 → "1:23" */
export function formatClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
