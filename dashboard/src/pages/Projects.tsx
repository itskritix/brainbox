import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Inbox } from "lucide-react";
import type { Project } from "@brainbox/shared";

import { Button } from "../components/ui/button";
import { CopyButton } from "../components/CopyButton";
import { DomainsEditor } from "../components/DomainsEditor";
import { Shell } from "../components/Shell";
import { api } from "../lib/api";
import { API_URL } from "../lib/authConfig";
import { timeAgo } from "../lib/utils";

function snippetFor(projectKey: string): string {
  return `<script src="https://app.brainbox.sh/widget.js" data-project="${projectKey}" data-endpoint="${API_URL}/ingest"></script>`;
}

/** Mono eyebrow — the card reads like a small spec sheet. */
function RowLabel({ children }: { children: string }) {
  return (
    <span className="w-20 shrink-0 pt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
      {children}
    </span>
  );
}

function ProjectCard({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: (p: Project) => void;
}) {
  const [showSnippet, setShowSnippet] = useState(false);
  const snippet = snippetFor(project.key);

  return (
    <li className="border-sheen rounded-2xl bg-elevated">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-baseline gap-3">
          <Link
            to={`/projects/${project.id}`}
            className="text-base font-medium text-emphasis hover:text-link"
          >
            {project.name}
          </Link>
          <span className="font-mono text-xs text-muted">
            created {timeAgo(project.createdAt)}
          </span>
        </div>
        <Link
          to={`/projects/${project.id}`}
          className="flex items-center gap-1.5 rounded-full border border-default px-3 py-1 text-xs text-default transition hover:bg-interactive-hover hover:text-emphasis"
        >
          <Inbox className="h-3 w-3" />
          {project.issueCount ?? 0} {project.issueCount === 1 ? "report" : "reports"}
        </Link>
      </div>

      <div className="mt-4 border-t border-default px-5">
        <div className="flex items-start gap-4 py-3">
          <RowLabel>Key</RowLabel>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <code className="truncate font-mono text-xs text-default">{project.key}</code>
            <CopyButton text={project.key} />
          </div>
        </div>

        <div className="flex items-start gap-4 border-t border-default py-3">
          <RowLabel>Domains</RowLabel>
          <div className="min-w-0 flex-1">
            <DomainsEditor
              projectId={project.id}
              origins={project.allowedOrigins}
              onChange={(allowedOrigins) => onUpdate({ ...project, allowedOrigins })}
            />
          </div>
        </div>

        <div className="flex items-start gap-4 border-t border-default py-3">
          <RowLabel>Install</RowLabel>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowSnippet((s) => !s)}
                className="flex items-center gap-1 text-xs text-muted transition hover:text-emphasis"
              >
                {showSnippet ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                {showSnippet ? "Hide snippet" : "Show snippet"}
              </button>
              <CopyButton text={snippet} label="Copy snippet" />
            </div>
            {showSnippet && (
              <code className="mt-2 block overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-subtle p-3 font-mono text-xs leading-relaxed text-muted">
                {snippet}
              </code>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

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
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-emphasis">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            One project per site or app that runs the widget.
          </p>
        </div>
      </div>

      <form onSubmit={create} className="mt-6 flex gap-2">
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

      <ul className="mt-8 space-y-4 pb-4">
        {projects?.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onUpdate={(next) =>
              setProjects((prev) => prev?.map((x) => (x.id === next.id ? next : x)) ?? null)
            }
          />
        ))}
        {projects?.length === 0 && !error && (
          <li className="border-sheen rounded-2xl bg-elevated p-10 text-center">
            <p className="text-sm text-default">No projects yet.</p>
            <p className="mt-1 text-sm text-muted">
              Create one above, then drop the install snippet into your app — feedback
              lands here.
            </p>
          </li>
        )}
        {projects === null && !error && <li className="text-sm text-muted">Loading…</li>}
      </ul>
    </Shell>
  );
}
