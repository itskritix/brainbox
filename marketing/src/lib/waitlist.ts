// Client for the public backend /waitlist endpoint. The API base URL mirrors
// the widget-loader convention: a prod default, overridable via env for local
// testing against a running backend (VITE_API_BASE_URL=http://localhost:8787).

export interface WaitlistEnv {
  VITE_API_BASE_URL?: string;
}

const DEFAULT_API_BASE_URL = "https://app.brainbox.sh";

export function resolveApiBaseUrl(env: WaitlistEnv): string {
  return (env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export type ReserveResult = { ok: true } | { ok: false; error: string };

/** Reserve early access for an email. Never throws - returns a tagged result. */
export async function reserveAccess(
  email: string,
  env: WaitlistEnv = import.meta.env,
): Promise<ReserveResult> {
  const trimmed = email.trim();
  if (!trimmed) return { ok: false, error: "Please enter your email." };

  try {
    const res = await fetch(`${resolveApiBaseUrl(env)}/waitlist`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    });

    if (res.ok) return { ok: true };
    if (res.status === 400) return { ok: false, error: "That email doesn't look right." };
    if (res.status === 429) {
      return { ok: false, error: "Too many attempts. Please try again in a minute." };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }
}
