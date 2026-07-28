// Geometry for the hand-drawn arrow that runs from the hero CTA down to the
// widget launcher in the corner.
//
// It has to be measured rather than drawn as a fixed asset: the launcher is
// pinned to the viewport corner while the hero CTA is centred in the page, so
// the gap between the two ends changes with every window size. A static SVG
// would only line up at one width.

export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ArrowGeometry {
  /** The sweeping curve, as an SVG path `d`. */
  curve: string;
  /** The two barbs of the arrowhead, as an SVG path `d`. */
  head: string;
  /** Where the curve begins - the label is parked here. */
  start: Point;
}

/** Widget launcher: `fixed bottom-5 right-5`, 48px square (widget Launcher.tsx). */
const LAUNCHER_INSET = 20;
const LAUNCHER_SIZE = 48;

/** How far short of the launcher's centre the arrowhead stops. */
const TIP_GAP = LAUNCHER_SIZE / 2 + 12;

const HEAD_LENGTH = 15;
const HEAD_SPREAD = 0.42; // radians either side of the incoming direction

export function launcherCenter(viewport: Viewport): Point {
  const offset = LAUNCHER_INSET + LAUNCHER_SIZE / 2;
  return { x: viewport.width - offset, y: viewport.height - offset };
}

/**
 * A curve from `from` to just short of `target`, arcing up and out before it
 * drops onto the launcher.
 *
 * The lift is deliberate. A straight line between the two points would cut
 * through the hero's own subhead and read as a divider; going over the top
 * keeps it clear of the text and makes it read as an annotation someone drew
 * on the page.
 */
export function arrowGeometry(from: Point, target: Point): ArrowGeometry {
  const dx = target.x - from.x;
  const dy = target.y - from.y;

  const lift = Math.min(110, Math.abs(dx) * 0.3);
  const c1: Point = { x: from.x + dx * 0.5, y: from.y - lift };
  // Held inside the target on both axes so the curve drops onto the launcher
  // from above-left. Steering it round the outside instead would run the tail
  // off the right edge of the window at narrow widths.
  const c2: Point = {
    x: target.x - Math.max(30, Math.abs(dx) * 0.08),
    y: target.y - Math.max(80, Math.abs(dy) * 0.55),
  };

  // Direction of travel as the curve arrives, taken from the last control
  // point: that's the cubic's tangent at its end.
  const inX = target.x - c2.x;
  const inY = target.y - c2.y;
  const length = Math.hypot(inX, inY) || 1;
  const ux = inX / length;
  const uy = inY / length;

  const end: Point = { x: target.x - ux * TIP_GAP, y: target.y - uy * TIP_GAP };

  const barb = (angle: number): Point => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Rotate the reversed direction, so the barbs open back up the curve.
    return {
      x: end.x + (-ux * cos - -uy * sin) * HEAD_LENGTH,
      y: end.y + (-ux * sin + -uy * cos) * HEAD_LENGTH,
    };
  };

  const left = barb(HEAD_SPREAD);
  const right = barb(-HEAD_SPREAD);

  return {
    curve: `M ${r(from.x)} ${r(from.y)} C ${r(c1.x)} ${r(c1.y)}, ${r(c2.x)} ${r(c2.y)}, ${r(end.x)} ${r(end.y)}`,
    head: `M ${r(left.x)} ${r(left.y)} L ${r(end.x)} ${r(end.y)} L ${r(right.x)} ${r(right.y)}`,
    start: from,
  };
}

function r(n: number): number {
  return Math.round(n * 10) / 10;
}
