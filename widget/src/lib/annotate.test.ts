import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearHighlights, liveMarkCount, showMark, undoLastMark } from "./annotate.ts";
import type { Mark } from "./marks.ts";

const box: Mark = { kind: "box", id: "b", color: "#ff4d4f", x: 10, y: 20, width: 100, height: 50 };
const query = () => document.querySelectorAll("[data-brainbox-highlight]");
const shape = () => query()[0]?.firstElementChild;

describe("annotate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearHighlights();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("paints into the host document, not the shadow root - that's what puts it in the replay", () => {
    showMark(box);
    expect(document.body.contains(query()[0] ?? null)).toBe(true);
  });

  it("sits in the page flow without intercepting the pointer", () => {
    showMark(box);
    const el = query()[0] as HTMLElement;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    // absolute, not fixed: the mark scrolls with the content it points at
    expect(el.style.position).toBe("absolute");
    expect(el.style.pointerEvents).toBe("none");
  });

  it("draws a box at its coordinates", () => {
    showMark(box);
    const rect = shape();
    expect(rect?.tagName).toBe("rect");
    expect(rect?.getAttribute("x")).toBe("10");
    expect(rect?.getAttribute("y")).toBe("20");
    expect(rect?.getAttribute("width")).toBe("100");
    expect(rect?.getAttribute("height")).toBe("50");
    expect(rect?.getAttribute("stroke")).toBe("#ff4d4f");
  });

  it("draws an arrow as a shaft plus a head", () => {
    showMark({ kind: "arrow", id: "a", color: "#fff", x1: 0, y1: 0, x2: 50, y2: 50 });
    const g = shape();
    expect(g?.tagName).toBe("g");
    expect(g?.querySelector("line")).toBeTruthy();
    expect(g?.querySelector("polygon")).toBeTruthy();
  });

  it("draws a stroke as a path", () => {
    showMark({
      kind: "pen",
      id: "p",
      color: "#fff",
      points: [{ x: 1, y: 1 }, { x: 9, y: 9 }, { x: 17, y: 1 }],
    });
    const path = shape();
    expect(path?.tagName).toBe("path");
    expect(path?.getAttribute("d")).toContain("Q");
  });

  it("draws text with a halo behind it", () => {
    showMark({ kind: "text", id: "t", color: "#fff", x: 5, y: 30, text: "broken" });
    const text = shape();
    expect(text?.tagName).toBe("text");
    expect(text?.textContent).toBe("broken");
    expect(text?.getAttribute("paint-order")).toBe("stroke");
  });

  it("stays put - a mark outlives the moment it was drawn", () => {
    showMark(box);
    vi.advanceTimersByTime(60_000);
    expect(query()).toHaveLength(1);
  });

  it("anchors to the document so a scroll doesn't leave it pointing at the wrong thing", () => {
    window.scrollX = 40;
    window.scrollY = 300;
    showMark(box);
    const rect = shape();
    expect(rect?.getAttribute("x")).toBe("50"); // 10 + 40
    expect(rect?.getAttribute("y")).toBe("320"); // 20 + 300
    window.scrollX = 0;
    window.scrollY = 0;
  });

  it("undoes the most recent mark only", () => {
    showMark(box);
    showMark({ ...box, x: 200 });
    expect(undoLastMark()).toBe(true);
    expect(query()).toHaveLength(1);
    expect(liveMarkCount()).toBe(1);
  });

  it("reports undo as a no-op when nothing is on the page", () => {
    expect(undoLastMark()).toBe(false);
  });

  it("clearHighlights removes every mark on the page", () => {
    showMark(box);
    showMark({ ...box, x: 200 });
    expect(liveMarkCount()).toBe(2);

    clearHighlights();
    expect(query()).toHaveLength(0);
    expect(liveMarkCount()).toBe(0);
  });

  it("clearHighlights with nothing active is a no-op", () => {
    expect(() => clearHighlights()).not.toThrow();
  });
});
