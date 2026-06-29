import { createMiddleware } from "hono/factory";

import { db } from "../db/client.ts";
import type { AppEnv } from "../types.ts";

// Expose the db on context so routes use c.get("db") (swappable in tests)
// rather than importing the singleton directly.
export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  c.set("db", db);
  await next();
});
