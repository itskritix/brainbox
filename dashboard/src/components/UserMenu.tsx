import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "@hono/auth-js/react";
import { EllipsisVertical, LogOut } from "lucide-react";

import { cn, userInitial } from "../lib/utils";

function Avatar({ image, initial, className }: { image?: string | null; initial: string; className?: string }) {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className={cn("shrink-0 rounded-lg object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-lg bg-interactive text-sm font-medium text-emphasis",
        className,
      )}
    >
      {initial}
    </span>
  );
}

/** Sidebar footer: user card that opens a menu (sign out) above it. */
export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
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

  const user = session?.user;
  const name = user?.name ?? user?.email ?? "";
  const initial = userInitial(user?.name, user?.email);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg p-2 text-left outline-none transition focus-visible:ring-[3px] focus-visible:ring-focus",
          open ? "bg-interactive" : "hover:bg-interactive-hover",
        )}
      >
        <Avatar image={user?.image} initial={initial} className="size-8" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-emphasis">{name}</span>
          {user?.email && user.name && (
            <span className="block truncate text-xs text-muted">{user.email}</span>
          )}
        </span>
        <EllipsisVertical className="h-4 w-4 shrink-0 text-muted" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-default bg-elevated shadow-3xl"
        >
          <div className="flex items-center gap-2.5 border-b border-default p-3">
            <Avatar image={user?.image} initial={initial} className="size-8" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-emphasis">{name}</span>
              {user?.email && user.name && (
                <span className="block truncate text-xs text-muted">{user.email}</span>
              )}
            </span>
          </div>
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-default transition hover:bg-interactive-hover hover:text-emphasis"
            >
              <LogOut className="h-4 w-4 shrink-0 text-muted" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
