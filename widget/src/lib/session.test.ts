import { describe, expect, it } from "vitest";
import { micOffsetMs } from "./session.ts";

describe("micOffsetMs", () => {
  it("returns how long after session start the mic came up", () => {
    expect(micOffsetMs(1_000, 1_350)).toBe(350);
  });

  it("clamps clock skew to zero", () => {
    expect(micOffsetMs(1_000, 990)).toBe(0);
  });

  it("returns null when the mic never started", () => {
    expect(micOffsetMs(1_000, null)).toBeNull();
  });
});
