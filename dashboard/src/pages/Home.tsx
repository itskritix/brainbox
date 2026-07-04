import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, useSession } from "@hono/auth-js/react";
import type { Project } from "@brainbox/shared";

import { Wordmark } from "../components/Wordmark";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";
import { LAST_PROJECT_KEY } from "../lib/useProject";
import { normalizeOrigin } from "../lib/utils";

/** First-run screen: name the project, optionally lock it to a domain. */
function Onboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const origin = domain.trim() ? normalizeOrigin(domain) : null;
    if (domain.trim() && !origin) {
      setError("Enter a domain like myapp.com or http://localhost:3000");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const project = await api.createProject({
        name: name.trim(),
        ...(origin ? { allowedOrigins: [origin] } : {}),
      });
      navigate(`/projects/${project.id}`, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="capture-corners mx-auto grid h-12 w-12 place-items-center">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-emphasis">
            <span className="h-2 w-2 rounded-full bg-background" />
          </span>
        </div>
        <h1 className="mt-6 text-center text-xl font-semibold tracking-tight text-emphasis">
          Create your project
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          One per site or app. You'll get the install snippet right after.
        </p>
        <form onSubmit={create} className="mt-8 space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name - e.g. Nidana"
            autoFocus
          />
          <Input
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setError(null);
            }}
            placeholder="Your app's domain (optional)"
            className="font-mono"
          />
          <Button type="submit" className="w-full" disabled={busy || !name.trim()}>
            {busy ? "Creating…" : "Create project"}
          </Button>
        </form>
        {error && <p className="mt-3 text-center text-sm text-error">{error}</p>}
      </div>
    </div>
  );
}

/** `/` - forwards to the last-used project; shows onboarding when there are none. */
export function Home() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!projects || projects.length === 0) return;
    const last = localStorage.getItem(LAST_PROJECT_KEY);
    const target = projects.find((p) => p.id === last) ?? projects[0];
    if (target) navigate(`/projects/${target.id}`, { replace: true });
  }, [projects, navigate]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-default">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4 sm:px-6">
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

      {error ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-error">{error}</p>
        </div>
      ) : projects?.length === 0 ? (
        <Onboarding />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
