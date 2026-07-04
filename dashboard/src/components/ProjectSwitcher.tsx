import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown } from "lucide-react";
import type { Project } from "@brainbox/shared";

import { cn } from "../lib/utils";

export function ProjectSwitcher({
  current,
  projects,
}: {
  current: Project;
  projects: Project[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-interactive bg-interactive px-2.5 py-2 text-left text-sm text-emphasis outline-none transition hover:bg-interactive-hover focus-visible:ring-[3px] focus-visible:ring-focus"
      >
        <span className="min-w-0 flex-1 truncate font-medium">{current.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 min-w-48 overflow-hidden rounded-xl border border-default bg-elevated shadow-3xl"
        >
          <ul className="max-h-64 overflow-y-auto py-1">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={p.id === current.id}
                  onClick={() => {
                    setOpen(false);
                    if (p.id !== current.id) navigate(`/projects/${p.id}`);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition hover:bg-interactive-hover",
                    p.id === current.id ? "text-emphasis" : "text-default",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  {p.id === current.id && <Check className="h-3.5 w-3.5 shrink-0 text-muted" />}
                </button>
              </li>
            ))}
          </ul>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block border-t border-default px-3 py-2 text-xs text-muted transition hover:bg-interactive-hover hover:text-emphasis"
          >
            All projects
          </Link>
        </div>
      )}
    </div>
  );
}
