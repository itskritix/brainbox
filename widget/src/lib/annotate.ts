import type { Region } from "@brainbox/shared";

const HIGHLIGHT = "#ff4d4f";
const HOLD_MS = 2500;
const LIFE_MS = 3000;

type Live = { el: HTMLElement; timers: ReturnType<typeof setTimeout>[] };
const live = new Set<Live>();

/** Draw a fading highlight box on the host page itself (NOT the shadow DOM) —
 *  rrweb records it as ordinary mutations, so it replays in the dashboard
 *  with no replay-side support. Viewport-anchored, like what the recorder saw. */
export function showHighlight(r: Region): void {
  const el = document.createElement("div");
  el.setAttribute("data-brainbox-highlight", "");
  el.setAttribute("aria-hidden", "true");
  el.setAttribute(
    "style",
    `position:fixed;left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px;` +
      `box-sizing:border-box;border:2px solid ${HIGHLIGHT};border-radius:6px;` +
      `background:rgba(255,77,79,0.12);pointer-events:none;z-index:2147483646;` +
      `opacity:1;transition:opacity 500ms ease-out;`,
  );
  document.body.appendChild(el);

  const entry: Live = { el, timers: [] };
  entry.timers.push(
    setTimeout(() => {
      el.style.opacity = "0";
    }, HOLD_MS),
    setTimeout(() => {
      el.remove();
      live.delete(entry);
    }, LIFE_MS),
  );
  live.add(entry);
}

/** Remove every pending highlight immediately (recording stopped or cancelled). */
export function clearHighlights(): void {
  for (const { el, timers } of live) {
    timers.forEach(clearTimeout);
    el.remove();
  }
  live.clear();
}
