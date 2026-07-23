import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { getAuthConfig } from "./auth/config.ts";
import { env } from "./env.ts";
import { dbMiddleware } from "./middleware/db.ts";
import { filesRoute } from "./routes/files.ts";
import { health } from "./routes/health.ts";
import { ingest } from "./routes/ingest.ts";
import { issuesRoute } from "./routes/issues.ts";
import { me } from "./routes/me.ts";
import { projectsRoute } from "./routes/projects.ts";
import { waitlist } from "./routes/waitlist.ts";
import type { AppEnv } from "./types.ts";

export const app = new Hono<AppEnv>();

// Dashboard SPA CORS scoped to /api/* only (credentials:true for the JWT cookie).
// /ingest is cross-origin from arbitrary customer sites and sets its own CORS.
app.use("/api/*", cors({ origin: env.DASHBOARD_ORIGIN, credentials: true }));

app.use("*", initAuthConfig(getAuthConfig));
app.use("*", dbMiddleware);

// Public routes (before the auth gate).
app.route("/health", health);
// Auth.js endpoints: /api/auth/signin, /callback/google, /session, ...
app.use("/api/auth/*", authHandler());
// Public widget ingest - auth is project key + origin allowlist, not a session.
app.route("/ingest", ingest);
// Public marketing waitlist capture - CORS-scoped to the marketing origins.
app.route("/waitlist", waitlist);

// Everything else under /api requires a valid session.
app.use("/api/*", verifyAuth());
app.route("/api/me", me);
app.route("/api/projects", projectsRoute);
app.route("/api/issues", issuesRoute);
app.route("/api/files", filesRoute);
