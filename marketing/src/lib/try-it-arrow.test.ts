import { describe, expect, it } from "vitest";
import { arrowGeometry, launcherCenter, type Point } from "./try-it-arrow.ts";

/** Pull the coordinate pairs back out of an SVG path `d`. */
function points(d: string): Point[] {
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const out: Point[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    out.push({ x: nums[i] ?? 0, y: nums[i + 1] ?? 0 });
  }
  return out;
}

const first = (d: string): Point => points(d)[0] ?? { x: NaN, y: NaN };
const last = (d: string): Point => points(d).at(-1) ?? { x: NaN, y: NaN };

describe("launcherCenter", () => {
  it("matches the widget's own bottom-5 right-5, 48px launcher", () => {
    // inset 20 + half of 48 = 44 in from each edge.
    expect(launcherCenter({ width: 1280, height: 860 })).toEqual({ x: 1236, y: 816 });
  });

  it("tracks the corner as the window resizes", () => {
    expect(launcherCenter({ width: 390, height: 844 })).toEqual({ x: 346, y: 800 });
  });
});

describe("arrowGeometry", () => {
  const from: Point = { x: 700, y: 560 };
  const target = launcherCenter({ width: 1280, height: 860 });
  const geom = arrowGeometry(from, target);

  it("starts exactly where it was told to", () => {
    expect(first(geom.curve)).toEqual(from);
    expect(geom.start).toEqual(from);
  });

  it("stops short of the launcher instead of ending under it", () => {
    const tip = last(geom.curve);
    const gap = Math.hypot(target.x - tip.x, target.y - tip.y);
    // Clear of the 24px-radius button, close enough to read as pointing at it.
    expect(gap).toBeGreaterThan(24);
    expect(gap).toBeLessThan(60);
  });

  it("arrives from above and to the left, never past the target", () => {
    const tip = last(geom.curve);
    expect(tip.x).toBeLessThan(target.x);
    expect(tip.y).toBeLessThan(target.y);
  });

  it("puts the arrowhead on the end of the curve, not the start", () => {
    const tip = last(geom.curve);
    const [, apex] = points(geom.head);
    expect(apex?.x).toBeCloseTo(tip.x, 1);
    expect(apex?.y).toBeCloseTo(tip.y, 1);
  });

  it("opens both barbs backwards up the curve", () => {
    const [left, apex, right] = points(geom.head);
    if (!left || !apex || !right) throw new Error("head should have three points");
    // Travelling down-right, so both barbs sit up-left of the tip.
    expect(left.y).toBeLessThan(apex.y);
    expect(right.x).toBeLessThan(apex.x);
    // Symmetric about the tip, so the head doesn't look bent.
    expect(Math.hypot(left.x - apex.x, left.y - apex.y)).toBeCloseTo(
      Math.hypot(right.x - apex.x, right.y - apex.y),
      1
    );
  });

  it("arcs above the straight line rather than cutting through the hero text", () => {
    const [, c1] = points(geom.curve);
    expect(c1?.y).toBeLessThan(from.y);
  });

  it("holds up at a narrow window, where the two ends nearly touch", () => {
    const tight = arrowGeometry({ x: 300, y: 500 }, launcherCenter({ width: 420, height: 700 }));
    const tip = last(tight.curve);
    expect(Number.isFinite(tip.x)).toBe(true);
    expect(Number.isFinite(tip.y)).toBe(true);
  });
});
