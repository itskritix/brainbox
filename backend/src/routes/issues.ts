import { eq } from "drizzle-orm";
import { Hono } from "hono";

import { issues, projects } from "../db/schema/index.ts";
import { toIssue } from "../lib/serialize.ts";
import { getStorage } from "../storage/index.ts";
import type { AppEnv } from "../types.ts";

export const issuesRoute = new Hono<AppEnv>().get("/:id", async (c) => {
  const uid = c.get("authUser").token?.sub;
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const db = c.get("db");
  const [row] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, c.req.param("id")))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);
  const [proj] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, row.projectId))
    .limit(1);
  if (!proj || proj.ownerId !== uid) return c.json({ error: "Not found" }, 404);
  return c.json(await toIssue(row, getStorage()));
});
