import type { BillingPeriod, BillingState, Issue, PlanId, Project } from "@brainbox/shared";

import { API_URL } from "./authConfig";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  // 402 means signed in but unpaid. Distinct from 401 so the user lands on the
  // plan picker instead of being bounced back through sign-in, which would
  // look like the login failed. /api/billing/* is never gated, so this cannot
  // loop.
  if (res.status === 402) {
    if (!window.location.pathname.startsWith("/billing")) {
      window.location.href = "/billing";
    }
    throw new Error("Subscription required");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listProjects: () => req<Project[]>("/api/projects"),
  createProject: (body: { name: string; allowedOrigins?: string[] }) =>
    req<Project>("/api/projects", { method: "POST", body: JSON.stringify(body) }),
  getProject: (id: string) => req<Project>(`/api/projects/${id}`),
  updateProject: (id: string, body: { name?: string; allowedOrigins?: string[] }) =>
    req<Project>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteProject: (id: string) => req<{ ok: boolean }>(`/api/projects/${id}`, { method: "DELETE" }),
  listIssues: (id: string) => req<Issue[]>(`/api/projects/${id}/issues`),
  getIssue: (id: string) => req<Issue>(`/api/issues/${id}`),

  getBillingState: () => req<BillingState>("/api/billing/subscription"),
  /** Returns the hosted Dodo checkout url to send the browser to. */
  startCheckout: (plan: PlanId, period: BillingPeriod) =>
    req<{ checkoutUrl: string }>("/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan, period }),
    }),
};
