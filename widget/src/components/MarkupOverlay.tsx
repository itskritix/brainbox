import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import {
  arrowHead,
  boundsOf,
  hitTest,
  DEFAULT_COLOR,
  isDegenerate,
  nextColor,
  normalizeBox,
  penPath,
  shouldKeepPoint,
  STROKE_WIDTH,
  TEXT_HALO,
  TEXT_HALO_WIDTH,
  TEXT_SIZE,
  type Mark,
  type Point,
  type Tool,
} from "../lib/marks.ts";
import { MarkupToolbar } from "./MarkupToolbar.tsx";

let seq = 0;
const nextId = () => `m${++seq}`;

const KEY_TO_TOOL: Record<string, Tool> = {
  v: "select",
  r: "box",
  a: "arrow",
  p: "pen",
  t: "text",
};

/**
 * The markup step: the page is frozen and the end-user draws on it - boxes,
 * arrows, freehand, text - before saying what's wrong.
 *
 * The screenshot is already rasterising when this mounts, so the marks are held
 * as vectors here and baked onto the shot on the way out. Drawing never waits
 * on the capture, and everything stays undoable right up to Done.
 */
export function MarkupOverlay({
  frozenUrl,
  pending,
  failed,
  onDone,
  onCancel,
}: {
  /** The frozen page, once rasterised. Until then the live page shows through. */
  frozenUrl?: string;
  pending: boolean;
  failed: boolean;
  onDone: (marks: Mark[]) => void;
  onCancel: () => void;
}) {
  const [tool, setTool] = useState<Tool>("box");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [past, setPast] = useState<Mark[][]>([]);
  const [draft, setDraft] = useState<Mark | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [typing, setTyping] = useState<{ x: number; y: number; value: string } | null>(null);
  const start = useRef<Point | null>(null);

  /** The stroke in progress, mutated on every pointer sample and flushed to
   *  state once per frame. A fast drag fires far more moves than the display
   *  refreshes, and re-rendering per sample is what makes a drawing surface
   *  feel like it's dragging behind the cursor. */
  const live = useRef<Mark | null>(null);
  const frame = useRef(0);

  const flush = useCallback(() => {
    frame.current = 0;
    setDraft(live.current ? { ...live.current } : null);
  }, []);

  const schedule = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(flush);
  }, [flush]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const commit = useCallback((next: Mark[]) => {
    setMarks((prev) => {
      setPast((p) => [...p, prev]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      const prev = p[p.length - 1];
      if (!prev) return p;
      setMarks(prev);
      setSelected(null);
      return p.slice(0, -1);
    });
  }, []);

  const removeSelected = useCallback(() => {
    if (!selected) return;
    commit(marks.filter((m) => m.id !== selected));
    setSelected(null);
  }, [commit, marks, selected]);

  const commitTyping = useCallback(() => {
    if (!typing) return;
    const mark: Mark = {
      kind: "text",
      id: nextId(),
      color,
      x: typing.x,
      y: typing.y,
      text: typing.value,
    };
    setTyping(null);
    if (!isDegenerate(mark)) commit([...marks, mark]);
  }, [color, commit, marks, typing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // While the text box is open every key belongs to it.
      if (typing) {
        if (e.key === "Escape") {
          e.preventDefault();
          setTyping(null);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        removeSelected();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        setColor(nextColor);
        return;
      }
      const next = KEY_TO_TOOL[e.key.toLowerCase()];
      if (next) {
        e.preventDefault();
        setTool(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, removeSelected, typing, undo]);

  const onPointerDown = (e: React.PointerEvent) => {
    const p = { x: e.clientX, y: e.clientY };

    // A click anywhere else closes an open text box rather than losing it.
    if (typing) {
      commitTyping();
      return;
    }

    if (tool === "select") {
      setSelected(hitTest(marks, p));
      return;
    }

    if (tool === "text") {
      setTyping({ x: p.x, y: p.y, value: "" });
      return;
    }

    // Keeps a drag alive if the pointer leaves the window mid-stroke. Not every
    // pointer can be captured (synthetic events, some pens) and a refusal only
    // costs us the off-screen tail of a stroke, so it must not break drawing.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* draw without capture */
    }
    start.current = p;
    setSelected(null);
    live.current =
      tool === "box"
        ? { kind: "box", id: nextId(), color, ...normalizeBox(p, p) }
        : tool === "arrow"
          ? { kind: "arrow", id: nextId(), color, x1: p.x, y1: p.y, x2: p.x, y2: p.y }
          : { kind: "pen", id: nextId(), color, points: [p] };
    schedule();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const from = start.current;
    const d = live.current;
    if (!from || !d) return;

    if (d.kind === "pen") {
      // Coalesced events are the samples the browser took between frames.
      // Reading them is what separates a smooth stroke from a polygon on a
      // fast drag - they cost nothing extra, we just have to ask.
      const samples = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
      for (const s of samples) {
        const p = { x: s.clientX, y: s.clientY };
        if (shouldKeepPoint(d.points[d.points.length - 1], p)) d.points.push(p);
      }
    } else {
      const p = { x: e.clientX, y: e.clientY };
      if (d.kind === "box") Object.assign(d, normalizeBox(from, p));
      else if (d.kind === "arrow") Object.assign(d, { x2: p.x, y2: p.y });
    }
    schedule();
  };

  const onPointerUp = () => {
    start.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    const d = live.current;
    live.current = null;
    setDraft(null);
    if (d && !isDegenerate(d)) commit([...marks, d]);
  };

  const committed = useMemo(() => marks.map((m) => <MarkShape key={m.id} mark={m} />), [marks]);

  const selectedBounds = useMemo(() => {
    const m = marks.find((x) => x.id === selected);
    return m ? boundsOf(m) : null;
  }, [marks, selected]);

  const cursor =
    tool === "select" ? "cursor-default" : tool === "text" ? "cursor-text" : "cursor-crosshair";

  return (
    <div
      className={`fixed inset-0 z-[2147483647] touch-none select-none overflow-hidden ${cursor}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {frozenUrl ? (
        <img
          src={frozenUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        // Until the freeze lands the live page shows through, dimmed - the user
        // can already start drawing and the marks land in the same coordinates.
        <div className="absolute inset-0 bg-black/30" />
      )}

      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {/* Held apart from the draft on purpose: the committed layer keeps the
            same element identities across a stroke, so React skips it entirely
            and only the one shape being drawn re-renders per frame. */}
        {committed}
        {draft && <MarkShape mark={draft} />}
        {selectedBounds && (
          <rect
            x={selectedBounds.x - 4}
            y={selectedBounds.y - 4}
            width={selectedBounds.width + 8}
            height={selectedBounds.height + 8}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}
      </svg>

      {typing && (
        <input
          autoFocus
          value={typing.value}
          onChange={(e) => setTyping({ ...typing, value: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitTyping();
            }
          }}
          placeholder="Type a note"
          className="absolute bg-transparent font-bold outline-none placeholder:font-normal placeholder:opacity-60"
          style={{
            left: typing.x,
            top: typing.y - TEXT_SIZE,
            color,
            fontSize: TEXT_SIZE,
            // mirrors the halo the mark gets once baked
            textShadow: `0 0 3px ${TEXT_HALO}, 0 0 3px ${TEXT_HALO}`,
            minWidth: 160,
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
        {pending ? (
          <span className="flex items-center gap-2 rounded-full bg-elevated px-3 py-1 text-xs text-default">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Freezing the page
          </span>
        ) : failed ? (
          <span className="flex items-center gap-2 rounded-full bg-warning px-3 py-1 text-xs text-warning">
            <ImageOff className="h-3.5 w-3.5" /> Couldn&apos;t grab the screenshot - your note
            still sends
          </span>
        ) : (
          <span className="rounded-full bg-elevated px-3 py-1 text-xs text-muted">
            Mark up what&apos;s wrong, then hit Done to describe it
          </span>
        )}
      </div>

      <MarkupToolbar
        tool={tool}
        color={color}
        canUndo={past.length > 0}
        canDelete={!!selected}
        markCount={marks.length}
        onTool={(t) => {
          commitTyping();
          setTool(t);
          setSelected(null);
        }}
        onColor={setColor}
        onUndo={undo}
        onDelete={removeSelected}
        onCancel={onCancel}
        onDone={() => onDone(marks)}
      />
    </div>
  );
}

const MarkShape = memo(function MarkShape({ mark }: { mark: Mark }) {
  switch (mark.kind) {
    case "box":
      return (
        <rect
          x={mark.x}
          y={mark.y}
          width={mark.width}
          height={mark.height}
          fill="none"
          stroke={mark.color}
          strokeWidth={STROKE_WIDTH}
        />
      );

    case "arrow": {
      const [tip, left, right] = arrowHead(mark);
      return (
        <g>
          <line
            x1={mark.x1}
            y1={mark.y1}
            x2={mark.x2}
            y2={mark.y2}
            stroke={mark.color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
          <polygon
            points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
            fill={mark.color}
          />
        </g>
      );
    }

    case "pen":
      return (
        <path
          d={penPath(mark)}
          fill="none"
          stroke={mark.color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );

    case "text":
      return (
        <text
          x={mark.x}
          y={mark.y}
          fill={mark.color}
          stroke={TEXT_HALO}
          strokeWidth={TEXT_HALO_WIDTH}
          paintOrder="stroke"
          fontSize={TEXT_SIZE}
          fontWeight={700}
        >
          {mark.text}
        </text>
      );
  }
});
