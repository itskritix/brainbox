import { NavLink } from "react-router-dom";

import { cn } from "../lib/utils";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const tab = (active: boolean) =>
    cn(
      "rounded-full px-3.5 py-1.5 text-sm transition",
      active
        ? "bg-interactive text-emphasis"
        : "text-muted hover:bg-interactive-hover hover:text-emphasis",
    );
  return (
    <nav className="mt-4 flex gap-1 border-b border-default pb-3">
      <NavLink to={`/projects/${projectId}`} end className={({ isActive }) => tab(isActive)}>
        Feedback
      </NavLink>
      <NavLink to={`/projects/${projectId}/settings`} className={({ isActive }) => tab(isActive)}>
        Settings
      </NavLink>
    </nav>
  );
}
