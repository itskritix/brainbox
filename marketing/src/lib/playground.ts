/**
 * Mission-clock label for the playground's launch countdown. The clock
 * counting *up* while wearing a "T-" prefix is one of the planted bugs.
 */
export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `T-${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
