import { describe, expect, it, vi } from "vitest";
import {
  arrowHead,
  boundsOf,
  hitTest,
  isDegenerate,
  normalizeBox,
  paintMarks,
  penPath,
  unionBounds,
  type ArrowMark,
  type BoxMark,
  type Canvas2D,
  type Mark,
  type PenMark,
  type TextMark,
} from "./marks.ts";

const box = (over: Partial<BoxMark> = {}): BoxMark => ({
  kind: "box",
  id: "b",
  color: "#f00",
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  ...over,
});

const arrow = (over: Partial<ArrowMark> = {}): ArrowMark => ({
  kind: "arrow",
  id: "a",
  color: "#f00",
  x1: 0,
  y1: 0,
  x2: 100,
  y2: 0,
  ...over,
});

const pen = (points: { x: number; y: number }[]): PenMark => ({
  kind: "pen",
  id: "p",
  color: "#f00",
  points,
});

const text = (over: Partial<TextMark> = {}): TextMark => ({
  kind: "text",
  id: "t",
  color: "#f00",
  x: 50,
  y: 100,
  text: "broken",
  ...over,
});

describe("normalizeBox", () => {
  it("normalises a down-right drag", () => {
    expect(normalizeBox({ x: 10, y: 20 }, { x: 40, y: 60 })).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });

  it("normalises an up-left drag to the same rect", () => {
    expect(normalizeBox({ x: 40, y: 60 }, { x: 10, y: 20 })).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });
});

describe("boundsOf", () => {
  it("returns a box as-is", () => {
    expect(boundsOf(box())).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it("normalises an arrow drawn right-to-left", () => {
    expect(boundsOf(arrow({ x1: 100, y1: 50, x2: 20, y2: 10 }))).toEqual({
      x: 20,
      y: 10,
      width: 80,
      height: 40,
    });
  });

  it("covers every point of a stroke", () => {
    expect(
      boundsOf(pen([{ x: 5, y: 5 }, { x: 30, y: 1 }, { x: 12, y: 40 }])),
    ).toEqual({ x: 5, y: 1, width: 25, height: 39 });
  });

  it("survives an empty stroke", () => {
    expect(boundsOf(pen([]))).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it("puts a text mark's box above its baseline", () => {
    const b = boundsOf(text());
    expect(b.y).toBeLessThan(100);
    expect(b.width).toBeGreaterThan(0);
  });
});

describe("unionBounds", () => {
  it("is null with nothing drawn", () => {
    expect(unionBounds([])).toBeNull();
  });

  it("covers marks in every direction", () => {
    const marks: Mark[] = [
      box({ x: 100, y: 100, width: 50, height: 50 }),
      arrow({ x1: 10, y1: 200, x2: 30, y2: 260 }),
    ];
    expect(unionBounds(marks)).toEqual({ x: 10, y: 100, width: 140, height: 160 });
  });

  it("returns the single mark's own box", () => {
    expect(unionBounds([box()])).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });
});

describe("hitTest", () => {
  it("misses empty space", () => {
    expect(hitTest([box()], { x: 500, y: 500 })).toBeNull();
  });

  it("hits inside the bounds", () => {
    expect(hitTest([box()], { x: 50, y: 40 })).toBe("b");
  });

  it("hits within the padding just outside the edge", () => {
    expect(hitTest([box()], { x: 8, y: 40 })).toBe("b");
  });

  it("returns the topmost (last drawn) mark when they overlap", () => {
    const under = box({ id: "under" });
    const over = box({ id: "over" });
    expect(hitTest([under, over], { x: 50, y: 40 })).toBe("over");
  });
});

describe("isDegenerate", () => {
  it("rejects a stray click", () => {
    expect(isDegenerate(box({ width: 2, height: 3 }))).toBe(true);
  });

  it("keeps a thin but long box", () => {
    expect(isDegenerate(box({ width: 200, height: 1 }))).toBe(false);
  });

  it("rejects empty text", () => {
    expect(isDegenerate(text({ text: "   " }))).toBe(true);
  });

  it("rejects a single-point stroke", () => {
    expect(isDegenerate(pen([{ x: 1, y: 1 }]))).toBe(true);
  });
});

describe("arrowHead", () => {
  it("puts the tip at the arrow's end", () => {
    const [tip] = arrowHead(arrow());
    expect(tip).toEqual({ x: 100, y: 0 });
  });

  it("puts both barbs behind the tip", () => {
    const [, left, right] = arrowHead(arrow());
    expect(left.x).toBeLessThan(100);
    expect(right.x).toBeLessThan(100);
    // symmetric about the shaft
    expect(left.y).toBeCloseTo(-right.y);
  });
});

describe("penPath", () => {
  it("moves to the first point and lines to the rest", () => {
    expect(penPath(pen([{ x: 1, y: 2 }, { x: 3, y: 4 }]))).toBe("M1 2 L3 4");
  });
});

/** Records the calls the painter makes so the bake can be asserted without a
 *  real canvas (jsdom has no 2D context). */
function stubCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    strokeRect: vi.fn(),
    strokeText: vi.fn(),
    fillText: vi.fn(),
    lineWidth: 0,
    strokeStyle: "" as string | CanvasGradient | CanvasPattern,
    fillStyle: "" as string | CanvasGradient | CanvasPattern,
    font: "",
    lineCap: "butt" as CanvasLineCap,
    lineJoin: "miter" as CanvasLineJoin,
  };
}

describe("paintMarks", () => {
  it("strokes a rect for a box", () => {
    const ctx = stubCtx();
    paintMarks(ctx satisfies Canvas2D, [box()]);
    expect(ctx.strokeRect).toHaveBeenCalledWith(10, 20, 100, 50);
  });

  it("draws an arrow as a shaft plus a filled head", () => {
    const ctx = stubCtx();
    paintMarks(ctx satisfies Canvas2D, [arrow()]);
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(100, 0);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });

  it("draws a stroke through every point", () => {
    const ctx = stubCtx();
    paintMarks(ctx satisfies Canvas2D, [pen([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }])]);
    expect(ctx.moveTo).toHaveBeenCalledWith(1, 1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(2);
  });

  it("skips an empty stroke instead of throwing", () => {
    const ctx = stubCtx();
    expect(() => paintMarks(ctx satisfies Canvas2D, [pen([])])).not.toThrow();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it("haloes text before filling it so it stays readable", () => {
    const ctx = stubCtx();
    paintMarks(ctx satisfies Canvas2D, [text()]);
    expect(ctx.strokeText).toHaveBeenCalledWith("broken", 50, 100);
    expect(ctx.fillText).toHaveBeenCalledWith("broken", 50, 100);
    expect(ctx.strokeText.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.fillText.mock.invocationCallOrder[0]!,
    );
  });

  it("paints marks in draw order", () => {
    const ctx = stubCtx();
    paintMarks(ctx satisfies Canvas2D, [box({ id: "first" }), box({ id: "second", x: 999 })]);
    expect(ctx.strokeRect.mock.calls[0]?.[0]).toBe(10);
    expect(ctx.strokeRect.mock.calls[1]?.[0]).toBe(999);
  });
});
