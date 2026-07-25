import { useEffect, useMemo, useRef, useState } from "react";
import { bandLevels, bandsChanged } from "./multiband.ts";

/** Live mic analysis, adapted from ElevenLabs UI's `bar-visualizer`
 *  (https://ui.elevenlabs.io/docs/components/bar-visualizer). Changes: the
 *  agent-state sequencer and demo mode are dropped (we only ever show a live
 *  mic) and the maths moved to multiband.ts so it can be tested. */

export interface MultibandOptions {
  bands?: number;
  /** FFT bin slice spread across the bars. */
  loPass?: number;
  hiPass?: number;
  /** Sampling throttle - rAF fires far more often than the eye needs. */
  updateInterval?: number;
  fftSize?: number;
}

/** Voice-tuned defaults. ElevenLabs ships bins 100-600 at fftSize 2048, which at
 *  48kHz is ~2.3-14kHz - mostly sibilance. Speech fundamentals and the first
 *  formants sit far lower, so this window starts near the bottom of the spectrum
 *  to make vowels move the bars. */
const DEFAULTS: Required<MultibandOptions> = {
  bands: 24,
  loPass: 2,
  hiPass: 110,
  updateInterval: 32,
  fftSize: 2048,
};

/**
 * Per-band loudness of a live mic stream, 0..1 per band.
 *
 * The meter is decoration: if the browser gives us no AudioContext the hook
 * stays flat and the recording carries on regardless.
 */
export function useMultibandVolume(
  stream: MediaStream | null,
  options: MultibandOptions = {},
): number[] {
  const { bands, loPass, hiPass, updateInterval, fftSize } = { ...DEFAULTS, ...options };
  const silent = useMemo(() => Array.from({ length: bands }, () => 0), [bands]);
  const [levels, setLevels] = useState<number[]>(silent);
  const latest = useRef<number[]>(silent);

  useEffect(() => {
    // Refs only - resetting state here would cascade a render every time the
    // stream identity changes.
    latest.current = silent;
    if (!stream || typeof AudioContext === "undefined") return;

    let ctx: AudioContext;
    let analyser: AnalyserNode;
    try {
      ctx = new AudioContext();
      analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      ctx.createMediaStreamSource(stream).connect(analyser);
    } catch {
      return;
    }

    const data = new Float32Array(analyser.frequencyBinCount);
    let frame = 0;
    let last = 0;

    const tick = (t: number) => {
      frame = requestAnimationFrame(tick);
      if (t - last < updateInterval) return;
      last = t;
      analyser.getFloatFrequencyData(data);
      const next = bandLevels(data, bands, loPass, hiPass);
      // Skip the render entirely while nothing audible is happening.
      if (!bandsChanged(next, latest.current)) return;
      latest.current = next;
      setLevels(next);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      analyser.disconnect();
      void ctx.close().catch(() => {});
    };
  }, [stream, bands, loPass, hiPass, updateInterval, fftSize, silent]);

  // Derived rather than reset in the effect, so detaching the stream flattens the
  // meter without an extra render pass.
  return stream ? levels : silent;
}
