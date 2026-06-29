import { Hono } from "hono";

import type { AppEnv } from "../types.ts";

// Mounted behind verifyAuth(), so reaching the handler implies a valid session.
// Returns the authenticated user — the end-to-end login proof route.
export const me = new Hono<AppEnv>().get("/", (c) => {
  const auth = c.get("authUser");
  return c.json(auth);
});
