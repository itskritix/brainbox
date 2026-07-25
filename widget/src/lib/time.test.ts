import { describe, expect, it } from "vitest";
import { fmtDuration } from "./time.ts";

describe("fmtDuration", () => {
  it("zero-pads the seconds", () => {
    expect(fmtDuration(0)).toBe("0:00");
    expect(fmtDuration(7)).toBe("0:07");
  });

  it("rolls over into minutes", () => {
    expect(fmtDuration(60)).toBe("1:00");
    expect(fmtDuration(125)).toBe("2:05");
  });

  it("floors fractional seconds", () => {
    expect(fmtDuration(9.87)).toBe("0:09");
  });

  it("falls back to zero for negative or non-finite input", () => {
    expect(fmtDuration(-3)).toBe("0:00");
    expect(fmtDuration(Number.NaN)).toBe("0:00");
    expect(fmtDuration(Number.POSITIVE_INFINITY)).toBe("0:00");
  });
});
