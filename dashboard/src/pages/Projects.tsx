import { useEffect, useState } from "react";
import { signOut } from "@hono/auth-js/react";
import { Link } from "react-router-dom";
import type { Project } from "@brainbox/shared";

import { Button } from "../components/ui/button";
import { api } from "../lib/api";
import { API_URL } from "../lib/authConfig";

function Snippet({ projectKey }: { projectKey: string }) {
  const snippet = `<script src="https://app.brainbox.sh/widget.js" data-project="${projectKey}" data-endpoint="${API_URL}/ingest"></script>`;
  return (
    <code className="mt-2 block overflow-x-auto rounded-lg bg-subtle p-3 font-mono text-xs text-muted">
      {snippet}
    </code>
  );
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
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
      setProjects((prev) => [project, ...prev]);
      setName("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between border-b border-default px-6 py-4">
        <h1 className="text-lg font-semibold text-emphasis">Projects</h1>
        <Button variant="ghost" onClick={() => signOut()}>
          Sign out
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <form onSubmit={create} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name"
            className="flex-1 rounded-xl border border-interactive bg-interactive px-3 py-2 text-sm text-emphasis placeholder:text-placeholder outline-none focus-visible:ring-[3px] focus-visible:ring-focus"
          />
          <Button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <ul className="mt-8 space-y-4">
          {projects.map((p) => (
            <li key={p.id} className="border-sheen rounded-2xl bg-elevated p-5">
              <div className="flex items-center justify-between">
                <Link
                  to={`/projects/${p.id}`}
                  className="text-base font-medium text-emphasis hover:text-link"
                >
                  {p.name}
                </Link>
                <span className="font-mono text-xs text-muted">{p.key}</span>
              </div>
              <Snippet projectKey={p.key} />
            </li>
          ))}
          {projects.length === 0 && !error && (
            <li className="text-sm text-muted">No projects yet. Create one above.</li>
          )}
        </ul>
      </main>
    </div>
  );
}
