import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearHighlights, showHighlight } from "./annotate.ts";

const region = { x: 10, y: 20, width: 100, height: 50 };
const query = () => document.querySelectorAll("[data-brainbox-highlight]");

describe("annotate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearHighlights();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("draws a fixed, non-interactive box at the region", () => {
    showHighlight(region);
    const el = query()[0] as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.style.position).toBe("fixed");
    expect(el.style.left).toBe("10px");
    expect(el.style.top).toBe("20px");
    expect(el.style.width).toBe("100px");
    expect(el.style.height).toBe("50px");
    expect(el.style.pointerEvents).toBe("none");
  });

  it("fades after the hold, removes at end of life", () => {
    showHighlight(region);
    const el = query()[0] as HTMLElement;
    expect(el.style.opacity).toBe("1");

    vi.advanceTimersByTime(2500);
    expect(el.style.opacity).toBe("0");
    expect(query()).toHaveLength(1);

    vi.advanceTimersByTime(500);
    expect(query()).toHaveLength(0);
  });

  it("clearHighlights removes every pending box and cancels timers", () => {
    showHighlight(region);
    showHighlight({ ...region, x: 200 });
    expect(query()).toHaveLength(2);

    clearHighlights();
    expect(query()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clearHighlights with nothing active is a no-op", () => {
    expect(() => clearHighlights()).not.toThrow();
  });
});
