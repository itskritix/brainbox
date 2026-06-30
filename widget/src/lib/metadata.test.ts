import { beforeAll, describe, expect, it } from "vitest";
import { captureMetadata, installCapture, setIdentity } from "./metadata.ts";

describe("metadata", () => {
  // Patch console.error once, before any test — so each test is order-independent
  // and works when run in isolation (e.g. under a Vitest name filter).
  beforeAll(() => installCapture());

  it("captures identity, selector, and the base page fields", () => {
    setIdentity({ id: "u1", email: "a@b.c" });
    const m = captureMetadata("div#x");
    expect(m.identity).toEqual({ id: "u1", email: "a@b.c" });
    expect(m.selector).toBe("div#x");
    expect(typeof m.url).toBe("string");
    expect(m.viewport).toHaveProperty("width");
    expect(Array.isArray(m.consoleErrors)).toBe(true);
  });

  it("buffers console.error into consoleErrors after installCapture", () => {
    console.error("boom-marker-42");
    const m = captureMetadata();
    expect(m.consoleErrors.some((e) => e.includes("boom-marker-42"))).toBe(true);
  });

  it("caps the rolling buffer at 20 (oldest dropped)", () => {
    for (let i = 0; i < 25; i++) console.error(`evt-${i}`);
    const m = captureMetadata();
    expect(m.consoleErrors.length).toBeLessThanOrEqual(20);
    expect(m.consoleErrors.some((e) => e.includes("evt-24"))).toBe(true);
    expect(m.consoleErrors.some((e) => e.includes("evt-0"))).toBe(false);
  });
});
