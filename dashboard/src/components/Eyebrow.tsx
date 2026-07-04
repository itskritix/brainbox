import type { ReactNode } from "react";

import { cn } from "../lib/utils";

/** Section label - mono, uppercase, tracked. The dashboard's structural voice. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn("font-mono text-[10px] uppercase tracking-[0.14em] text-muted", className)}
    >
      {children}
    </span>
  );
}
