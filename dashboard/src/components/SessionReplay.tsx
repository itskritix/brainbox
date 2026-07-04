import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Replayer } from "@rrweb/replay";
import "@rrweb/replay/dist/style.css";

import { formatClock } from "../lib/issue";

type ReplayerEvents = ConstructorParameters<typeof Replayer>[0];

// rrweb-player's shipped dist is broken (its Player never constructs a Replayer),
// so we drive @rrweb/replay directly with our own play/seek controls.
export function SessionReplay({ url, vw, vh }: { url: string; vw: number; vh: number }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<Replayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const el = frameRef.current;
    if (!el) return;

    // fit the frame to the recorded viewport's aspect ratio
    const width = el.clientWidth || 640;
    el.style.height = `${Math.min(560, Math.max(240, Math.round(width * (vh / Math.max(vw, 1)))))}px`;

    (async () => {
      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Session fetch failed (${res.status})`);
        const buf = await res.arrayBuffer();
        let text: string;
        if (url.endsWith(".gz") && typeof DecompressionStream !== "undefined") {
          const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
          text = await new Response(ds).text();
        } else {
          text = new TextDecoder().decode(buf);
        }
        const parsed = JSON.parse(text) as { events?: unknown[] };
        const events = parsed.events ?? [];
        if (cancelled) return;
        if (events.length < 2) {
          setError("Recording too short to replay");
          return;
        }

        const { Replayer: ReplayerCtor } = await import("@rrweb/replay");
        if (cancelled) return;
        const replayer = new ReplayerCtor(events as ReplayerEvents, {
          root: el,
          skipInactive: true,
          showWarning: false,
        });
        replayerRef.current = replayer;
        setTotal(replayer.getMetaData().totalTime);
        replayer.pause(0); // render the first frame

        const applyScale = () => {
          const { wrapper, iframe } = replayer;
          const fw = iframe.offsetWidth || vw;
          const fh = iframe.offsetHeight || vh;
          const scale = Math.min(
            el.clientWidth / Math.max(fw, 1),
            el.clientHeight / Math.max(fh, 1),
          );
          wrapper.style.position = "absolute";
          wrapper.style.left = "50%";
          wrapper.style.top = "50%";
          wrapper.style.transformOrigin = "0 0";
          wrapper.style.transform = `scale(${scale}) translate(-50%, -50%)`;
        };
        applyScale();
        replayer.on("resize", applyScale);
        replayer.on("finish", () => setPlaying(false));
        window.addEventListener("resize", applyScale);
        cleanup = () => window.removeEventListener("resize", applyScale);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load recording");
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
      try {
        replayerRef.current?.pause();
      } catch {
        /* replayer may never have initialized */
      }
      replayerRef.current = null;
      el.innerHTML = "";
      setPlaying(false);
      setTime(0);
    };
  }, [url, vw, vh]);

  // progress clock while playing
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const r = replayerRef.current;
      if (r) setTime(Math.min(r.getCurrentTime(), r.getMetaData().totalTime));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const toggle = useCallback(() => {
    const r = replayerRef.current;
    if (!r) return;
    if (playing) {
      r.pause();
      setTime(r.getCurrentTime());
      setPlaying(false);
    } else {
      r.play(time >= total ? 0 : time);
      setPlaying(true);
    }
  }, [playing, time, total]);

  const seek = useCallback(
    (ms: number) => {
      const r = replayerRef.current;
      if (!r) return;
      setTime(ms);
      if (playing) r.play(ms);
      else r.pause(ms);
    },
    [playing],
  );

  if (error) {
    return (
      <p className="rounded-lg border border-error-subtle bg-error p-3 text-xs text-error">
        {error}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-default bg-elevated">
      <div ref={frameRef} className="relative w-full overflow-hidden bg-subtle" />
      <div className="flex items-center gap-3 border-t border-default px-3 py-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="rounded-full bg-brand p-2 text-on-brand transition hover:bg-brand-hover"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(total, 1)}
          value={Math.min(time, total)}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full"
        />
        <span className="shrink-0 font-mono text-xs text-muted">
          {formatClock(time)} / {formatClock(total)}
        </span>
      </div>
    </div>
  );
}
