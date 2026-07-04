import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { signOut, useSession } from "@hono/auth-js/react";

import { Button } from "./ui/button";

function Wordmark() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-md bg-emphasis">
        <span className="h-1.5 w-1.5 rounded-full bg-background" />
      </span>
      <span className="text-sm font-semibold tracking-tight text-emphasis">brainbox</span>
    </Link>
  );
}

/** Crumbs render as "Projects / Nidana / Feedback" — last one is the page. */
export function Shell({
  crumbs = [],
  wide = false,
  children,
}: {
  crumbs?: { label: string; to?: string }[];
  wide?: boolean;
  children: ReactNode;
}) {
  const { data } = useSession();
  const width = wide ? "max-w-6xl" : "max-w-4xl";
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-default bg-background/90 backdrop-blur">
        <div className={`mx-auto flex h-14 ${width} items-center justify-between px-4 sm:px-6`}>
          <div className="flex min-w-0 items-center gap-3">
            <Wordmark />
            <div className="hidden min-w-0 items-center gap-3 sm:flex">
              {crumbs.length > 0 && <span className="text-muted">/</span>}
              {crumbs.map((c, i) => (
                <span key={i} className="flex min-w-0 items-center gap-3 text-sm">
                  {c.to ? (
                    <Link to={c.to} className="truncate text-muted hover:text-emphasis">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="truncate text-default">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span className="text-muted">/</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {data?.user?.email && (
              <span className="hidden font-mono text-xs text-muted sm:block">
                {data.user.email}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className={`mx-auto ${width} px-4 py-8 sm:px-6 sm:py-10`}>{children}</main>
    </div>
  );
}
