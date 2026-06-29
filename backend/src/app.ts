import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { getAuthConfig } from "./auth/config.ts";
import { env } from "./env.ts";
import { dbMiddleware } from "./middleware/db.ts";
import { health } from "./routes/health.ts";
import { me } from "./routes/me.ts";
import type { AppEnv } from "./types.ts";

export const app = new Hono<AppEnv>();

// CORS for the dashboard SPA (step 5). credentials:true so the JWT session
// cookie is allowed cross-origin.
app.use("*", cors({ origin: env.DASHBOARD_ORIGIN, credentials: true }));

app.use("*", initAuthConfig(getAuthConfig));
app.use("*", dbMiddleware);

// Public routes (before the auth gate).
app.route("/health", health);
// Auth.js endpoints: /api/auth/signin, /callback/google, /session, ...
app.use("/api/auth/*", authHandler());
// Step 3 note: /ingest mounts HERE (public) — its auth is project key + origin.

// Everything else under /api requires a valid session.
app.use("/api/*", verifyAuth());
app.route("/api/me", me);
