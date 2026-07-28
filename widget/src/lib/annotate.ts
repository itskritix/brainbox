import {
  arrowHead,
  penPath,
  STROKE_WIDTH,
  TEXT_HALO,
  TEXT_HALO_WIDTH,
  TEXT_SIZE,
  type Mark,
} from "./marks.ts";

const HOLD_MS = 2500;
const LIFE_MS = 3000;
const SVG_NS = "http://www.w3.org/2000/svg";

type Live = { el: HTMLElement; timers: ReturnType<typeof setTimeout>[] };
const live = new Set<Live>();

/** One mark as SVG built with the DOM API rather than React.
 *  It has to live in the host document (see `showMark`), which React isn't
 *  rendering, so this mirrors `MarkShape` node for node. */
function shapeFor(m: Mark): SVGElement {
  const el = (tag: string, attrs: Record<string, string | number>): SVGElement => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    return node;
  };

  switch (m.kind) {
    case "box":
      return el("rect", {
        x: m.x,
        y: m.y,
        width: m.width,
        height: m.height,
        fill: "none",
        stroke: m.color,
        "stroke-width": STROKE_WIDTH,
      });

    case "arrow": {
      const [tip, left, right] = arrowHead(m);
      const g = el("g", {});
      g.appendChild(
        el("line", {
          x1: m.x1,
          y1: m.y1,
          x2: m.x2,
          y2: m.y2,
          stroke: m.color,
          "stroke-width": STROKE_WIDTH,
          "stroke-linecap": "round",
        }),
      );
      g.appendChild(
        el("polygon", {
          points: `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`,
          fill: m.color,
        }),
      );
      return g;
    }

    case "pen":
      return el("path", {
        d: penPath(m),
        fill: "none",
        stroke: m.color,
        "stroke-width": STROKE_WIDTH,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      });

    case "text": {
      const t = el("text", {
        x: m.x,
        y: m.y,
        fill: m.color,
        stroke: TEXT_HALO,
        "stroke-width": TEXT_HALO_WIDTH,
        "paint-order": "stroke",
        "font-size": TEXT_SIZE,
        "font-weight": 700,
        "font-family": "ui-sans-serif, system-ui, sans-serif",
      });
      t.textContent = m.text;
      return t;
    }
  }
}

/**
 * Draw a fading mark on the host page itself (NOT the shadow DOM).
 *
 * The shadow host is `rr-block`ed so the widget's own chrome stays out of
 * recordings; putting the mark in the host document instead means rrweb sees
 * it as ordinary mutations and it replays in the dashboard with no
 * replay-side support at all.
 *
 * It fades because a recording is temporal: a box drawn at 0:04 belongs at
 * 0:04. Marks that accumulated would end up smeared across the whole replay,
 * pointing at things that had long since scrolled away.
 */
export function showMark(m: Mark): void {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("data-brainbox-highlight", "");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute(
    "style",
    "position:fixed;left:0;top:0;width:100vw;height:100vh;overflow:visible;" +
      "pointer-events:none;z-index:2147483646;opacity:1;transition:opacity 500ms ease-out;",
  );
  svg.appendChild(shapeFor(m));
  document.body.appendChild(svg);

  const entry: Live = { el: svg as unknown as HTMLElement, timers: [] };
  entry.timers.push(
    setTimeout(() => {
      svg.style.opacity = "0";
    }, HOLD_MS),
    setTimeout(() => {
      svg.remove();
      live.delete(entry);
    }, LIFE_MS),
  );
  live.add(entry);
}

/** Remove every pending mark immediately (recording stopped or cancelled). */
export function clearHighlights(): void {
  for (const { el, timers } of live) {
    timers.forEach(clearTimeout);
    el.remove();
  }
  live.clear();
}
