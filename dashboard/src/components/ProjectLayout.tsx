import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { signOut, useSession } from "@hono/auth-js/react";
import { Inbox, LogOut, Settings } from "lucide-react";
import type { Project } from "@brainbox/shared";

import { api } from "../lib/api";
import type { ProjectOutletContext } from "../lib/useProject";
import { cn } from "../lib/utils";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { Spinner } from "./ui/spinner";
import { Wordmark } from "./Wordmark";

function NavItem({
  to,
  active,
  icon,
  label,
  count,
}: {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition [&_svg]:size-4 [&_svg]:shrink-0",
        active
          ? "bg-interactive text-emphasis"
          : "text-muted hover:bg-interactive-hover hover:text-emphasis",
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="font-mono text-xs text-muted">{count}</span>}
    </Link>
  );
}

function MobileTab({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm transition",
        active
          ? "bg-interactive text-emphasis"
          : "text-muted hover:bg-interactive-hover hover:text-emphasis",
      )}
    >
      {label}
    </Link>
  );
}

/** Sidebar shell for everything inside one project. Fetches the project list
 *  once and hands the current project to child routes via outlet context. */
export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6">
        <div className="text-center">
          <p className="text-sm text-error">{error}</p>
          <Link to="/" className="mt-2 inline-block text-sm text-link hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }
  if (!projects) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Spinner />
      </div>
    );
  }

  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6">
        <div className="text-center">
          <p className="text-sm text-default">This project doesn't exist or isn't yours.</p>
          <Link to="/" className="mt-2 inline-block text-sm text-link hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const base = `/projects/${project.id}`;
  const isSettings = location.pathname.endsWith("/settings");
  const context: ProjectOutletContext = {
    project,
    projects,
    setProject: (next) =>
      setProjects((prev) => prev?.map((p) => (p.id === next.id ? next : p)) ?? prev),
  };

  return (
    <div className="min-h-dvh bg-background lg:flex lg:h-dvh lg:overflow-hidden">
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-default">
        <div className="px-4 pb-4 pt-5">
          <Wordmark />
        </div>
        <div className="px-3">
          <ProjectSwitcher current={project} projects={projects} />
        </div>
        <nav className="mt-4 flex flex-col gap-0.5 px-3">
          <NavItem
            to={base}
            active={!isSettings}
            icon={<Inbox />}
            label="Inbox"
            count={project.issueCount}
          />
          <NavItem to={`${base}/settings`} active={isSettings} icon={<Settings />} label="Settings" />
        </nav>
        <div className="mt-auto flex items-center gap-2 border-t border-default px-4 py-3">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted">
            {session?.user?.email ?? ""}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-muted transition hover:bg-interactive-hover hover:text-emphasis"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:min-h-0">
        <header className="sticky top-0 z-10 border-b border-default bg-background/90 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <ProjectSwitcher current={project} projects={projects} />
            </div>
            <nav className="flex shrink-0 gap-1">
              <MobileTab to={base} active={!isSettings} label="Inbox" />
              <MobileTab to={`${base}/settings`} active={isSettings} label="Settings" />
            </nav>
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="Sign out"
              className="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-interactive-hover hover:text-emphasis"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet context={context} />
        </main>
      </div>
    </div>
  );
}
