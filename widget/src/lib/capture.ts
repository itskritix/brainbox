import { domToCanvas } from "modern-screenshot";
import type { Region } from "@brainbox/shared";

const HIGHLIGHT = "#ff4d4f";

/** Render the current viewport to a canvas. The whole shadow host is hidden
 *  during capture so widget chrome never appears in the shot (ADR 0001). */
async function viewportCanvas(hostEl: HTMLElement): Promise<HTMLCanvasElement> {
  const prev = hostEl.style.visibility;
  hostEl.style.visibility = "hidden";
  let full: HTMLCanvasElement;
  try {
    full = await domToCanvas(document.documentElement, { scale: 1 });
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

/** Plain viewport shot — used as the thumbnail/last-frame of a session recording. */
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
