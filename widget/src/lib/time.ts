/** Seconds as `m:ss` - shared by the record overlay and the voice note meter. */
export function fmtDuration(total: number): string {
  const safe = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
