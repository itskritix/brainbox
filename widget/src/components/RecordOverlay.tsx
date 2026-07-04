import { useEffect, useRef, useState } from "react";
import { Highlighter, Mic, MicOff, Square } from "lucide-react";
import { showHighlight } from "../lib/annotate.ts";
import { posClass, type Position } from "../lib/position.ts";
import { RegionOverlay } from "./RegionOverlay.tsx";

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RecordOverlay({
  position,
  onStop,
  micActive,
}: {
  position: Position;
  onStop: () => void;
  micActive: () => boolean;
}) {
  const [secs, setSecs] = useState(0);
  const [highlighting, setHighlighting] = useState(false);
  const [micOn, setMicOn] = useState(false);
  // App passes an inline arrow - keep it out of the interval's deps via a ref.
  const micRef = useRef(micActive);
  useEffect(() => {
    micRef.current = micActive;
  }, [micActive]);

  useEffect(() => {
    setMicOn(micRef.current());
    const t = setInterval(() => {
      setSecs((s) => s + 1);
      // the mic can arrive seconds in, once the permission prompt is answered
      setMicOn(micRef.current());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  if (highlighting) {
    return (
      <RegionOverlay
        caption="Drag to draw a highlight · Esc to cancel"
        dim={0.15}
        onComplete={(r) => {
          showHighlight(r);
          setHighlighting(false);
        }}
        onCancel={() => setHighlighting(false)}
      />
    );
  }

  return (
    <div
      className={`fixed ${posClass(position)} z-[2147483647] flex items-center gap-3 rounded-full border border-default bg-elevated px-4 py-2 shadow-3xl`}
    >
      <span className="flex items-center gap-2 text-sm text-emphasis">
        <span
          className="h-2.5 w-2.5 animate-pulse rounded-full"
          style={{ background: "#ef4444" }}
        />
        <span className="font-mono">{fmt(secs)}</span>
      </span>
      <button
        onClick={() => setHighlighting(true)}
        title="Highlight an area - viewers see it in the replay"
        className="flex items-center gap-1 rounded-full border border-default px-3 py-1 text-xs text-default hover:bg-interactive-hover hover:text-emphasis"
      >
        <Highlighter className="h-3 w-3" /> Highlight
      </button>
      <span
        title={micOn ? "Voice is being captured" : "Mic off - voice not captured"}
        className={micOn ? "text-emphasis" : "text-muted"}
      >
        {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
      </span>
      <button
        onClick={onStop}
        className="flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-medium text-on-brand hover:bg-brand-hover"
      >
        <Square className="h-3 w-3" /> Stop
      </button>
    </div>
  );
}
