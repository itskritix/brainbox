import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { issues, projects } from "../db/schema/index.ts";
import { generateProjectKey } from "../lib/projectKey.ts";
import { toIssue, toProject } from "../lib/serialize.ts";
import { getStorage } from "../storage/index.ts";
import type { AppEnv } from "../types.ts";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  allowedOrigins: z.array(z.string()).optional(),
});

export const projectsRoute = new Hono<AppEnv>()
  .get("/", async (c) => {
    const uid = c.get("authUser").token?.sub;
    if (!uid) return c.json({ error: "Unauthorized" }, 401);
    const db = c.get("db");
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, uid))
      .orderBy(desc(projects.createdAt));
    return c.json(rows.map(toProject));
  })
  .post("/", async (c) => {
    const uid = c.get("authUser").token?.sub;
    if (!uid) return c.json({ error: "Unauthorized" }, 401);
    const parsed = createSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: "Invalid body", issues: parsed.error.issues }, 400);
    }
    const db = c.get("db");
    const [row] = await db
      .insert(projects)
      .values({
        ownerId: uid,
        name: parsed.data.name,
        key: generateProjectKey(),
        allowedOrigins: parsed.data.allowedOrigins ?? [],
      })
      .returning();
    return c.json(toProject(row), 201);
  })
  .get("/:id", async (c) => {
    const uid = c.get("authUser").token?.sub;
    if (!uid) return c.json({ error: "Unauthorized" }, 401);
    const db = c.get("db");
    const [row] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, c.req.param("id")))
      .limit(1);
    if (!row || row.ownerId !== uid) return c.json({ error: "Not found" }, 404);
    return c.json(toProject(row));
  })
  .get("/:id/issues", async (c) => {
    const uid = c.get("authUser").token?.sub;
    if (!uid) return c.json({ error: "Unauthorized" }, 401);
    const db = c.get("db");
    const projectId = c.req.param("id");
    const [proj] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (!proj || proj.ownerId !== uid) return c.json({ error: "Not found" }, 404);
    const rows = await db
      .select()
      .from(issues)
      .where(eq(issues.projectId, projectId))
      .orderBy(desc(issues.createdAt));
    const storage = getStorage();
    return c.json(await Promise.all(rows.map((r) => toIssue(r, storage))));
  });
