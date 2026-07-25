import { describe, expect, it } from "vitest";
import { bandLevels, bandsChanged, downsample, meanLevel, normalizeDb } from "./multiband.ts";

describe("normalizeDb", () => {
  it("reports silence at or below the floor", () => {
    expect(normalizeDb(-100)).toBe(0);
    expect(normalizeDb(-140)).toBe(0);
  });

  it("treats -Infinity (a dead bin) as silence", () => {
    expect(normalizeDb(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(normalizeDb(Number.NaN)).toBe(0);
  });

  it("rises monotonically with loudness", () => {
    expect(normalizeDb(-80)).toBeGreaterThan(normalizeDb(-90));
    expect(normalizeDb(-30)).toBeGreaterThan(normalizeDb(-80));
  });

  it("clamps at the ceiling", () => {
    expect(normalizeDb(-10)).toBeCloseTo(normalizeDb(0));
    expect(normalizeDb(0)).toBeLessThanOrEqual(1);
  });
});

describe("bandLevels", () => {
  const flat = (n: number, db: number) => new Float32Array(n).fill(db);

  it("emits exactly `bands` values", () => {
    expect(bandLevels(flat(256, -50), 5, 0, 256)).toHaveLength(5);
    expect(bandLevels(flat(1024, -50), 28, 100, 600)).toHaveLength(28);
  });

  it("reports silence for a silent spectrum", () => {
    expect(bandLevels(flat(128, -100), 4, 0, 128)).toEqual([0, 0, 0, 0]);
  });

  it("gives every band the same level for a flat spectrum", () => {
    const bands = bandLevels(flat(128, -40), 4, 0, 128);
    expect(new Set(bands.map((b) => b.toFixed(6))).size).toBe(1);
  });

  it("localises energy to the band that contains it", () => {
    const data = new Float32Array(128).fill(-100);
    data[10] = -20;
    const bands = bandLevels(data, 4, 0, 128);
    expect(bands[0]).toBeGreaterThan(0);
    expect(bands[1]).toBe(0);
    expect(bands[3]).toBe(0);
  });

  it("clamps a bin range that runs past the buffer", () => {
    const bands = bandLevels(flat(64, -40), 4, 0, 9999);
    expect(bands).toHaveLength(4);
    expect(bands.every((b) => b > 0)).toBe(true);
  });

  it("returns silence when the range is empty", () => {
    expect(bandLevels(flat(64, -40), 3, 50, 50)).toEqual([0, 0, 0]);
  });

  it("returns nothing for a non-positive band count", () => {
    expect(bandLevels(flat(64, -40), 0, 0, 64)).toEqual([]);
  });
});

describe("bandsChanged", () => {
  it("is true when a band moves past the threshold", () => {
    expect(bandsChanged([0.5], [0.2])).toBe(true);
  });

  it("is false for imperceptible drift", () => {
    expect(bandsChanged([0.5, 0.5], [0.502, 0.499])).toBe(false);
  });

  it("is true when the band count changes", () => {
    expect(bandsChanged([0.5], [0.5, 0.5])).toBe(true);
  });

  it("honours a custom threshold", () => {
    expect(bandsChanged([0.5], [0.4], 0.2)).toBe(false);
    expect(bandsChanged([0.5], [0.4], 0.05)).toBe(true);
  });
});

describe("meanLevel", () => {
  it("averages the bands", () => {
    expect(meanLevel([0, 1])).toBe(0.5);
    expect(meanLevel([0.2, 0.2, 0.2])).toBeCloseTo(0.2);
  });

  it("is zero for no bands", () => {
    expect(meanLevel([])).toBe(0);
  });
});

describe("downsample", () => {
  it("pads an empty clip out to the bar count", () => {
    expect(downsample([], 3)).toEqual([0, 0, 0]);
  });

  it("averages each bucket", () => {
    expect(downsample([0, 1, 0, 1], 2)).toEqual([0.5, 0.5]);
  });

  it("always emits exactly `count` bars, whether up- or downsampling", () => {
    expect(downsample([0.4, 0.8], 6)).toHaveLength(6);
    expect(
      downsample(
        Array.from({ length: 500 }, () => 0.2),
        24,
      ),
    ).toHaveLength(24);
  });

  it("preserves the shape of the envelope", () => {
    const ramp = Array.from({ length: 100 }, (_, i) => i / 99);
    const bars = downsample(ramp, 4);
    expect(bars[0]).toBeLessThan(bars[3] ?? 0);
  });

  it("returns nothing for a non-positive bar count", () => {
    expect(downsample([0.5], 0)).toEqual([]);
  });
});
