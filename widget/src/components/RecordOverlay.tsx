import { useEffect, useState } from "react";
import { Square } from "lucide-react";
import { posClass, type Position } from "../lib/position.ts";

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RecordOverlay({ position, onStop }: { position: Position; onStop: () => void }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

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
        onClick={onStop}
        className="flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-medium text-on-brand hover:bg-brand-hover"
      >
        <Square className="h-3 w-3" /> Stop
      </button>
    </div>
  );
}
