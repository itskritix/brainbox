import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "2m ago" / "3h ago" / "5d ago" - falls back to a date for older items. */
export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Same local calendar day as `now` - the "Today" group boundary, so a report
 *  from 11pm yesterday is "Earlier" even if it's less than 24h old. */
export function isToday(iso: string, now: Date = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Single-letter avatar fallback: first letter of the name, else of the email,
 *  else "?" for a session with neither. */
export function userInitial(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim();
  const first = source?.[0];
  return first ? first.toUpperCase() : "?";
}

/** Turn user input ("myapp.com/path", "http://localhost:3000") into the exact
 *  Origin the browser will send: scheme + host (+ port). Null if unparseable. */
export function normalizeOrigin(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin.toLowerCase();
  } catch {
    return null;
  }
}
