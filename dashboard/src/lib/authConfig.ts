import { authConfigManager } from "@hono/auth-js/react";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

// Point the Auth.js React client at the backend's auth endpoints (cross-origin)
// and send the session cookie. Must run before any useSession/signIn.
authConfigManager.setConfig({
  baseUrl: API_URL,
  basePath: "/api/auth",
  credentials: "include",
});
