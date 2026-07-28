import {
  ArrowUpRight,
  Check,
  MousePointer2,
  Pencil,
  Square,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { MARK_COLORS, type Tool } from "../lib/marks.ts";

/** Single-key shortcuts, the way every markup tool does it. Shown in the
 *  tooltip so they're discoverable without a legend. */
const TOOLS: { tool: Tool; label: string; key: string; Icon: typeof Square }[] = [
  { tool: "select", label: "Select", key: "v", Icon: MousePointer2 },
  { tool: "box", label: "Box", key: "r", Icon: Square },
  { tool: "arrow", label: "Arrow", key: "a", Icon: ArrowUpRight },
  { tool: "pen", label: "Draw", key: "p", Icon: Pencil },
  { tool: "text", label: "Text", key: "t", Icon: Type },
];

export function MarkupToolbar({
  tool,
  color,
  canUndo,
  canDelete,
  markCount,
  onTool,
  onColor,
  onUndo,
  onDelete,
  onCancel,
  onDone,
}: {
  tool: Tool;
  color: string;
  canUndo: boolean;
  canDelete: boolean;
  markCount: number;
  onTool: (t: Tool) => void;
  onColor: (c: string) => void;
  onUndo: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  return (
    // Bottom-centre, out of the way of the page header - which is usually the
    // thing being reported. Stops pointer events reaching the drawing surface
    // so clicking a tool never also draws a mark.
    <div
      className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 rounded-xl border border-default bg-elevated px-1.5 py-1 shadow-3xl">
        <IconButton label="Undo (⌘Z)" disabled={!canUndo} onClick={onUndo}>
          <Undo2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Delete (⌫)" disabled={!canDelete} onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </IconButton>

        <span className="mx-1 h-5 w-px bg-subtle" />

        {MARK_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={`Colour ${c}`}
            aria-label={`Colour ${c}`}
            aria-pressed={c === color}
            onClick={() => onColor(c)}
            className={`h-5 w-5 rounded-full border transition ${
              c === color ? "border-interactive scale-110" : "border-default"
            }`}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-2xl border border-default bg-elevated p-1.5 shadow-3xl">
        {TOOLS.map(({ tool: t, label, key, Icon }) => (
          <button
            key={t}
            type="button"
            title={`${label} (${key})`}
            aria-label={label}
            aria-pressed={t === tool}
            onClick={() => onTool(t)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              t === tool
                ? "bg-brand text-on-brand"
                : "text-default hover:bg-interactive-hover hover:text-emphasis"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        <span className="mx-1 h-6 w-px bg-subtle" />

        <button
          type="button"
          onClick={onCancel}
          title="Cancel (Esc)"
          className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm text-default hover:bg-interactive-hover hover:text-emphasis"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-medium text-on-brand shadow-button hover:bg-brand-hover"
        >
          <Check className="h-4 w-4" />
          {markCount > 0 ? "Done" : "Skip"}
        </button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-default hover:bg-interactive-hover hover:text-emphasis disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
