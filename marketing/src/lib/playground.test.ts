import { describe, expect, it } from "vitest";
import { formatCountdown } from "./playground.ts";

describe("formatCountdown", () => {
  it("zero-pads minutes and seconds", () => {
    expect(formatCountdown(0)).toBe("T-00:00");
    expect(formatCountdown(47)).toBe("T-00:47");
    expect(formatCountdown(125)).toBe("T-02:05");
  });

  it("clamps negatives and fractions", () => {
    expect(formatCountdown(-5)).toBe("T-00:00");
    expect(formatCountdown(61.9)).toBe("T-01:01");
  });
});
