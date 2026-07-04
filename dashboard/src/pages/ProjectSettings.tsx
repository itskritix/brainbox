import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Project } from "@brainbox/shared";

import { CopyButton } from "../components/CopyButton";
import { DomainsEditor } from "../components/DomainsEditor";
import { ProjectTabs } from "../components/ProjectTabs";
import { Shell } from "../components/Shell";
import { api } from "../lib/api";
import { API_URL } from "../lib/authConfig";

function snippetFor(projectKey: string): string {
  return `<script src="https://app.brainbox.sh/widget.js" data-project="${projectKey}" data-endpoint="${API_URL}/ingest"></script>`;
}

/** A labeled settings row — label above content on mobile, side-by-side wider. */
function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-default py-4 first:border-t-0 sm:flex-row sm:gap-4">
      <div className="sm:w-36 sm:shrink-0 sm:pt-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {label}
        </span>
        {hint && <p className="mt-1 hidden text-xs text-muted sm:block">{hint}</p>}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function ProjectSettings() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSnippet, setShowSnippet] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getProject(id).then(setProject).catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <Shell crumbs={[{ label: "Projects", to: "/" }, { label: "Settings" }]}>
        <p className="text-sm text-error">{error}</p>
      </Shell>
    );
  }

  const snippet = project ? snippetFor(project.key) : "";

  return (
    <Shell crumbs={[{ label: "Projects", to: "/" }, { label: project?.name ?? "…" }]}>
      <h1 className="text-xl font-semibold tracking-tight text-emphasis">
        {project?.name ?? "Settings"}
      </h1>
      <p className="mt-1 text-sm text-muted">Keys, domains, and the install snippet.</p>
      {id && <ProjectTabs projectId={id} />}

      {!project ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <div className="border-sheen mt-6 rounded-2xl bg-elevated px-4 py-1 sm:px-6">
          <Row label="Key" hint="Identifies this project in the snippet.">
            <div className="flex items-center justify-between gap-3">
              <code className="truncate font-mono text-xs text-default sm:text-sm">
                {project.key}
              </code>
              <CopyButton text={project.key} />
            </div>
          </Row>

          <Row label="Domains" hint="Only these sites can send feedback.">
            <DomainsEditor
              projectId={project.id}
              origins={project.allowedOrigins}
              onChange={(allowedOrigins) => setProject({ ...project, allowedOrigins })}
            />
          </Row>

          <Row label="Install" hint="Paste before </body> on your site.">
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
              <code className="mt-3 block overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-subtle p-3 font-mono text-xs leading-relaxed text-muted">
                {snippet}
              </code>
            )}
          </Row>
        </div>
      )}
    </Shell>
  );
}
