/** Frequency-band loudness maths, adapted from ElevenLabs UI's `bar-visualizer`
 *  (https://ui.elevenlabs.io/docs/components/bar-visualizer). Kept pure and
 *  separate from the React hook so it is testable without an AudioContext. */

/** The dB window worth showing. Below -100 is silence, above -10 is clipping. */
const MIN_DB = -100;
const MAX_DB = -10;

/** A single FFT bin's dB value as a 0..1 level. The sqrt lifts quiet speech into
 *  the visible range - a linear map leaves normal talking barely off the floor. */
export function normalizeDb(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const clamped = Math.max(MIN_DB, Math.min(MAX_DB, value));
  return Math.sqrt(1 - (clamped * -1) / 100);
}

/**
 * Average `data` into `bands` buckets across the bin range [loPass, hiPass).
 *
 * Splitting the spectrum is what makes the meter read as a voice: each bar
 * tracks its own slice of frequency, so they move independently instead of
 * showing one overall level duplicated across the row.
 */
export function bandLevels(
  data: Readonly<Float32Array>,
  bands: number,
  loPass: number,
  hiPass: number,
): number[] {
  if (bands <= 0) return [];
  const lo = Math.max(0, Math.min(loPass, data.length));
  const hi = Math.max(lo, Math.min(hiPass, data.length));
  if (hi === lo) return Array.from({ length: bands }, () => 0);

  const chunk = Math.max(1, Math.ceil((hi - lo) / bands));
  return Array.from({ length: bands }, (_, i) => {
    const from = lo + i * chunk;
    const to = Math.min(from + chunk, hi);
    let sum = 0;
    let n = 0;
    for (let j = from; j < to; j += 1) {
      const v = data[j];
      if (v === undefined) continue;
      sum += normalizeDb(v);
      n += 1;
    }
    return n === 0 ? 0 : sum / n;
  });
}

/** True when any band moved enough to be worth a re-render. Called every frame,
 *  so this is what keeps the meter off the render path while the room is quiet. */
export function bandsChanged(
  next: readonly number[],
  prev: readonly number[],
  threshold = 0.01,
): boolean {
  if (next.length !== prev.length) return true;
  return next.some((v, i) => Math.abs(v - (prev[i] ?? 0)) > threshold);
}

/** Bars never fully collapse - a flat line reads as "broken", not "quiet". */
const FLOOR = 12;

/** A 0..1 level as a bar height percentage. */
export function barHeight(level: number): number {
  const clamped = Math.min(1, Math.max(0, level));
  return FLOOR + clamped * (100 - FLOOR);
}

/** One overall 0..1 level from a band set - recorded per tick to redraw the clip
 *  as a static envelope during playback. */
export function meanLevel(bands: readonly number[]): number {
  if (bands.length === 0) return 0;
  let sum = 0;
  for (const b of bands) sum += b;
  return sum / bands.length;
}

/** Average a whole clip's recorded levels into `count` buckets - the envelope
 *  shown as a fixed number of bars once recording stops. */
export function downsample(levels: readonly number[], count: number): number[] {
  if (count <= 0) return [];
  if (levels.length === 0) return Array.from({ length: count }, () => 0);
  return Array.from({ length: count }, (_, i) => {
    const from = Math.floor((i * levels.length) / count);
    const to = Math.max(from + 1, Math.floor(((i + 1) * levels.length) / count));
    let sum = 0;
    let n = 0;
    for (let j = from; j < to && j < levels.length; j += 1) {
      const v = levels[j];
      if (v === undefined) continue;
      sum += v;
      n += 1;
    }
    return n === 0 ? 0 : sum / n;
  });
}
