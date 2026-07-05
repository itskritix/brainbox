import { API_URL } from "../lib/authConfig";
import { snippetFor, type SnippetOptions } from "../lib/snippet";
import { CopyButton } from "./CopyButton";

/** The install tag, presented as a small code editor pane with a copy action. */
export function InstallSnippet({
  projectKey,
  options,
}: {
  projectKey: string;
  options?: SnippetOptions;
}) {
  const snippet = snippetFor(projectKey, `${API_URL}/ingest`, options);
  return (
    <div className="overflow-hidden rounded-xl border border-default bg-subtle">
      <div className="flex items-center justify-between border-b border-default px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          index.html
        </span>
        <CopyButton text={snippet} label="Copy snippet" />
      </div>
      <code className="block overflow-x-auto whitespace-pre-wrap break-all p-3 font-mono text-xs leading-relaxed text-default">
        {snippet}
      </code>
    </div>
  );
}
