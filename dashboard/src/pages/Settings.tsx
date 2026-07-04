import { CopyButton } from "../components/CopyButton";
import { DomainsEditor } from "../components/DomainsEditor";
import { Eyebrow } from "../components/Eyebrow";
import { InstallSnippet } from "../components/InstallSnippet";
import { useProject } from "../lib/useProject";

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <Eyebrow className="block">{label}</Eyebrow>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Settings() {
  const { project, setProject } = useProject();

  return (
    <div className="min-h-0 flex-1 lg:overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-lg font-semibold tracking-tight text-emphasis">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Install, key, and allowed domains for {project.name}.
        </p>

        <div className="mt-8">
          <Section
            label="Install"
            hint="Paste before </body> on every page you want feedback from."
          >
            <InstallSnippet projectKey={project.key} />
          </Section>

          <Section label="Project key" hint="Identifies this project in the snippet.">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-default bg-elevated px-4 py-3">
              <code className="truncate font-mono text-xs text-default sm:text-sm">
                {project.key}
              </code>
              <CopyButton text={project.key} />
            </div>
          </Section>

          <Section label="Domains" hint="Only these sites can send feedback.">
            <div className="rounded-xl border border-default bg-elevated px-4 py-3.5">
              <DomainsEditor
                projectId={project.id}
                origins={project.allowedOrigins}
                onChange={(allowedOrigins) => setProject({ ...project, allowedOrigins })}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
