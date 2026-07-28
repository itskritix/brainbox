import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mic, MicOff, MousePointer2, Pencil, Square, Type } from "lucide-react";
import { showMark } from "../lib/annotate.ts";
import { DEFAULT_COLOR, nextColor, type Mark, type Tool } from "../lib/marks.ts";
import { isDragTool, nextMarkId, useDrawing } from "../lib/use-drawing.ts";
import { posClass, type Position } from "../lib/position.ts";
import { fmtDuration } from "../lib/time.ts";
import { MarkShape, MarkTextInput } from "./MarkShape.tsx";

/** `null` means "hands off - the user is driving their own app". Everything
 *  else arms the drawing surface. */
type RecordTool = Tool | null;

const TOOLS: { tool: Exclude<RecordTool, null | "select">; label: string; Icon: typeof Square }[] = [
  { tool: "box", label: "Box", Icon: Square },
  { tool: "arrow", label: "Arrow", Icon: ArrowUpRight },
  { tool: "pen", label: "Draw", Icon: Pencil },
  { tool: "text", label: "Text", Icon: Type },
];

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
  const [tool, setTool] = useState<RecordTool>(null);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [typing, setTyping] = useState<{ x: number; y: number; value: string } | null>(null);
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

  // A finished mark goes straight to the host page, where rrweb records it and
  // it fades. Nothing accumulates here - the replay is the only place it lives.
  const commit = useCallback((m: Mark) => showMark(m), []);
  const { draft, begin, extend, finish } = useDrawing({ color, onCommit: commit });

  const commitTyping = useCallback(() => {
    if (!typing) return;
    const text = typing.value.trim();
    setTyping(null);
    if (text) {
      showMark({ kind: "text", id: nextMarkId(), color, x: typing.x, y: typing.y, text });
    }
  }, [color, typing]);

  // Esc backs out of drawing rather than stopping the recording - stopping is a
  // deliberate act and shouldn't share a key with "put the pen down".
  useEffect(() => {
    if (!tool) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (typing) setTyping(null);
      else setTool(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool, typing]);

  return (
    <>
      {tool && (
        <div
          className={`fixed inset-0 z-[2147483646] touch-none select-none ${
            tool === "text" ? "cursor-text" : "cursor-crosshair"
          }`}
          onPointerDown={(e) => {
            if (typing) {
              commitTyping();
              return;
            }
            if (tool === "text") {
              setTyping({ x: e.clientX, y: e.clientY, value: "" });
              return;
            }
            if (isDragTool(tool)) begin(tool, e);
          }}
          onPointerMove={extend}
          onPointerUp={finish}
          onPointerCancel={finish}
        >
          {/* Only the stroke in progress renders here. Once it's committed it
              belongs to the host page, so it appears in the replay - drawing it
              twice would double it up on screen. */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            {draft && <MarkShape mark={draft} />}
          </svg>

          {typing && (
            <MarkTextInput
              at={typing}
              color={color}
              onChange={(value) => setTyping({ ...typing, value })}
              onCommit={commitTyping}
              onCancel={() => setTyping(null)}
            />
          )}
        </div>
      )}

      <div
        className={`fixed ${posClass(position)} z-[2147483647] flex items-center gap-1 rounded-full border border-default bg-elevated px-3 py-2 shadow-3xl`}
      >
        <span className="mr-1 flex items-center gap-2 text-sm text-emphasis">
          <span
            className="h-2.5 w-2.5 animate-pulse rounded-full"
            style={{ background: "#ef4444" }}
          />
          <span className="font-mono">{fmtDuration(secs)}</span>
        </span>

        {/* Hands-off is a tool like any other, and it's the default: the user is
            recording their app, not drawing on it, most of the time. */}
        <ToolButton
          label="Use the page"
          active={tool === null}
          onClick={() => {
            commitTyping();
            setTool(null);
          }}
        >
          <MousePointer2 className="h-4 w-4" />
        </ToolButton>

        {TOOLS.map(({ tool: t, label, Icon }) => (
          <ToolButton
            key={t}
            label={label}
            active={tool === t}
            onClick={() => {
              commitTyping();
              setTool(t);
            }}
          >
            <Icon className="h-4 w-4" />
          </ToolButton>
        ))}

        <button
          type="button"
          title="Colour"
          aria-label="Colour"
          onClick={() => setColor(nextColor)}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-interactive-hover"
        >
          <span
            className="h-4 w-4 rounded-full border border-default"
            style={{ background: color }}
          />
        </button>

        <span className="mx-1 h-5 w-px bg-subtle" />

        <span
          title={micOn ? "Voice is being captured" : "Mic off - voice not captured"}
          className={micOn ? "text-emphasis" : "text-muted"}
        >
          {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
        </span>
        <button
          onClick={onStop}
          className="ml-1 flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-medium text-on-brand hover:bg-brand-hover"
        >
          <Square className="h-3 w-3" /> Stop
        </button>
      </div>
    </>
  );
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-brand text-on-brand"
          : "text-default hover:bg-interactive-hover hover:text-emphasis"
      }`}
    >
      {children}
    </button>
  );
}
