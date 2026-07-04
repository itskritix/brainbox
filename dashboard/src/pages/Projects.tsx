import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Project } from "@brainbox/shared";

import { Button } from "../components/ui/button";
import { Shell } from "../components/Shell";
import { api } from "../lib/api";
import { timeAgo } from "../lib/utils";

export function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listProjects().then(setProjects).catch((e: Error) => setError(e.message));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const project = await api.createProject({ name: name.trim() });
      setProjects((prev) => [{ ...project, issueCount: 0 }, ...(prev ?? [])]);
      setName("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Shell>
      <h1 className="text-xl font-semibold tracking-tight text-emphasis">Projects</h1>
      <p className="mt-1 text-sm text-muted">One project per site or app that runs the widget.</p>

      <form onSubmit={create} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="flex-1 rounded-xl border border-interactive bg-interactive px-3 py-2 text-sm text-emphasis placeholder:text-placeholder outline-none focus-visible:ring-[3px] focus-visible:ring-focus"
        />
        <Button type="submit" disabled={creating || !name.trim()}>
          {creating ? "Creating…" : "Create project"}
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <ul className="mt-8 space-y-3 pb-4">
        {projects?.map((p) => (
          <li key={p.id}>
            <Link
              to={`/projects/${p.id}`}
              className="border-sheen flex items-center gap-4 rounded-2xl bg-elevated p-4 transition hover:bg-interactive-hover sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-emphasis">{p.name}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  created {timeAgo(p.createdAt)}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-default px-3 py-1 text-xs text-default">
                {p.issueCount ?? 0} {p.issueCount === 1 ? "report" : "reports"}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
        {projects?.length === 0 && !error && (
          <li className="border-sheen rounded-2xl bg-elevated p-10 text-center">
            <p className="text-sm text-default">No projects yet.</p>
            <p className="mt-1 text-sm text-muted">
              Create one above, then grab the install snippet from its settings — feedback
              lands on the project page.
            </p>
          </li>
        )}
        {projects === null && !error && <li className="text-sm text-muted">Loading…</li>}
      </ul>
    </Shell>
  );
}
