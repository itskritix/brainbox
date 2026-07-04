import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut, useSession } from "@hono/auth-js/react";
import { ChevronRight, FolderPlus } from "lucide-react";
import type { Project } from "@brainbox/shared";

import { EmptyState } from "../components/EmptyState";
import { Wordmark } from "../components/Wordmark";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { api } from "../lib/api";
import { timeAgo } from "../lib/utils";

export function Projects() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch((e: Error) => setError(e.message));
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
    <div className="min-h-dvh bg-background">
      <header className="border-b border-default">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Wordmark />
          <div className="flex items-center gap-3">
            {session?.user?.email && (
              <span className="hidden font-mono text-xs text-muted sm:block">
                {session.user.email}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight text-emphasis">Projects</h1>
        <p className="mt-1 text-sm text-muted">One per site or app that runs the widget.</p>

        <form onSubmit={create} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
          />
          <Button type="submit" disabled={creating || !name.trim()}>
            {creating ? "Creating…" : "Create project"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <div className="mt-8 pb-4">
          {projects === null && !error && (
            <div className="overflow-hidden rounded-xl border border-default">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="border-b border-subtle px-4 py-4 last:border-0">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="mt-2 h-3 w-1/4" />
                </div>
              ))}
            </div>
          )}

          {projects && projects.length > 0 && (
            <ul className="overflow-hidden rounded-xl border border-default">
              {projects.map((p) => (
                <li key={p.id} className="border-b border-subtle last:border-0">
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-interactive-hover"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-emphasis">{p.name}</p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                        {p.key} · created {timeAgo(p.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {p.issueCount ?? 0} {p.issueCount === 1 ? "report" : "reports"}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {projects?.length === 0 && !error && (
            <EmptyState icon={<FolderPlus />} title="Create your first project" className="py-12">
              <p className="mt-1 max-w-xs text-sm text-muted">
                Name it after your app. You'll get an install snippet, and reports land in its
                inbox.
              </p>
            </EmptyState>
          )}
        </div>
      </main>
    </div>
  );
}
