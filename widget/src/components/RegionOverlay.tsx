import { useEffect, useRef, useState } from "react";
import type { Region } from "@brainbox/shared";

type Pt = { x: number; y: number };
const HIGHLIGHT = "#ff4d4f";

function rectFrom(a: Pt, b: Pt): Region {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

export function RegionOverlay({
  onComplete,
  onCancel,
  caption = "Drag to highlight the problem area · Esc to cancel",
  dim = 0.35,
}: {
  onComplete: (r: Region) => void;
  onCancel: () => void;
  caption?: string;
  dim?: number;
}) {
  const [box, setBox] = useState<Region | null>(null);
  const start = useRef<Pt | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[2147483647] cursor-crosshair select-none"
      style={{ background: `rgba(0,0,0,${dim})` }}
      onMouseDown={(e) => {
        const p = { x: e.clientX, y: e.clientY };
        start.current = p;
        setBox({ x: p.x, y: p.y, width: 0, height: 0 });
      }}
      onMouseMove={(e) => {
        if (!start.current) return;
        setBox(rectFrom(start.current, { x: e.clientX, y: e.clientY }));
      }}
      onMouseUp={() => {
        const b = box;
        start.current = null;
        if (b && b.width > 6 && b.height > 6) onComplete(b);
        else onCancel();
      }}
    >
      {/* Bottom-anchored: the top of the page is what the user is usually
          reporting on, and a bar sitting over it hides the thing they came to
          highlight. It also puts the hint where the annotation toolbar lives. */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-elevated px-3 py-1 text-xs text-default">
        {caption}
      </div>
      {box && (
        <div
          className="pointer-events-none absolute border-2"
          style={{
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            borderColor: HIGHLIGHT,
            background: "rgba(255,77,79,0.1)",
          }}
        />
      )}
    </div>
  );
}
