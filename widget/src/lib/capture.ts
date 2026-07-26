import { domToCanvas } from "modern-screenshot";
import type { Region } from "@brainbox/shared";

const HIGHLIGHT = "#ff4d4f";

/** Never rendered, so never worth cloning or serialising - big inline <script>
 *  blobs and unmounted <template> markup are pure capture cost. <style> stays:
 *  the clone still needs its rules. */
const INVISIBLE = new Set(["SCRIPT", "NOSCRIPT", "TEMPLATE"]);

/** A stalled asset must not hold the report hostage - well under the 30s default. */
const ASSET_TIMEOUT_MS = 6000;

/** Positions that lay a box out against an ancestor rather than its parent, so a
 *  descendant can paint far outside the subtree it lives in. */
const ESCAPES = new Set(["absolute", "fixed", "sticky"]);

/**
 * A `filter` that drops everything outside the viewport.
 *
 * We rasterise the whole document and then crop to the viewport, so on a long
 * page most of that work is discarded - a page 4x the viewport pays 4x for one
 * screenshot, and the cost is CPU-bound cloning and per-node style resolution,
 * not pixels. Off-screen elements cannot affect a viewport crop, so skipping
 * them in the clone is free.
 *
 * The exception is escaping descendants: an absolutely positioned child is laid
 * out against an ancestor, so pruning a parent by its own box could drop a child
 * that was actually on screen. Ancestors of any escaping element are kept whole
 * and everything else is judged on its own box.
 */
function viewportFilter(): (node: Node) => boolean {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const keepWhole = new Set<Element>();
  for (const el of Array.from(document.querySelectorAll("*"))) {
    if (!ESCAPES.has(getComputedStyle(el).position)) continue;
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (keepWhole.has(p)) break;
      keepWhole.add(p);
    }
  }

  return (node) => {
    if (!(node instanceof Element)) return true;
    if (INVISIBLE.has(node.tagName)) return false;
    if (keepWhole.has(node)) return true;
    return keepForViewport(node.getBoundingClientRect(), vw, vh);
  };
}

/** Whether a box can still affect a viewport-sized crop. Split out from the DOM
 *  walk so the edge cases are unit-testable. */
export function keepForViewport(
  r: { top: number; bottom: number; left: number; right: number; width: number; height: number },
  vw: number,
  vh: number,
): boolean {
  // A zero-size box says nothing useful - keep it and judge its children on
  // their own boxes.
  if (r.width === 0 && r.height === 0) return true;
  return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
}

/** Render the current viewport to a canvas. The whole shadow host is hidden
 *  during capture so widget chrome never appears in the shot (ADR 0001). */
async function viewportCanvas(hostEl: HTMLElement): Promise<HTMLCanvasElement> {
  const prev = hostEl.style.visibility;
  hostEl.style.visibility = "hidden";
  let full: HTMLCanvasElement;
  try {
    full = await domToCanvas(document.documentElement, {
      scale: 1,
      timeout: ASSET_TIMEOUT_MS,
      filter: viewportFilter(),
      // Every @font-face in the host's CSS is fetched and inlined; on a
      // font-heavy page that dominates capture time. One modern format is
      // enough - a host serving only legacy formats falls back to system fonts
      // in the shot, which is an acceptable trade for a bug screenshot.
      font: { preferredFormat: "woff2" },
      features: { copyScrollbar: false },
    });
  } finally {
    hostEl.style.visibility = prev;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const out = document.createElement("canvas");
  out.width = vw;
  out.height = vh;

  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // modern-screenshot renders the element from its origin; crop to the viewport.
  ctx.drawImage(full, window.scrollX, window.scrollY, vw, vh, 0, 0, vw, vh);
  return out;
}

/** Screenshot the current viewport with the selected region outlined. */
export async function captureScreenshot(region: Region, hostEl: HTMLElement): Promise<Blob> {
  const out = await viewportCanvas(hostEl);
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.strokeStyle = HIGHLIGHT;
  ctx.lineWidth = 3;
  ctx.strokeRect(region.x, region.y, region.width, region.height);
  return await toBlob(out);
}

/** Plain viewport shot - used as the thumbnail/last-frame of a session recording. */
export async function captureViewport(hostEl: HTMLElement): Promise<Blob> {
  return toBlob(await viewportCanvas(hostEl));
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Screenshot encoding failed"))),
      "image/png",
    );
  });
}
