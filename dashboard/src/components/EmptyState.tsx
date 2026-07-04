import type { ReactNode } from "react";

import { cn } from "../lib/utils";

/** Centered empty/placeholder state framed by the capture-corner signature. */
export function EmptyState({
  icon,
  title,
  breathe = false,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  /** Slow pulse on the frame - reserved for "waiting for data" states. */
  breathe?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div
        className={cn(
          "capture-corners grid h-12 w-12 place-items-center text-muted [&_svg]:size-5",
          breathe && "animate-breathe",
        )}
      >
        {icon}
      </div>
      <p className="mt-5 text-sm font-medium text-emphasis">{title}</p>
      {children}
    </div>
  );
}
