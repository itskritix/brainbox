import { encode } from "@auth/core/jwt";

import { db } from "../src/db/client.ts";
import { issues, projects, users } from "../src/db/schema/index.ts";
import { generateProjectKey } from "../src/lib/projectKey.ts";
import { testEnv } from "./env.ts";

// Auth.js jwt session cookie name on http/localhost (no __Secure- prefix).
const COOKIE_NAME = "authjs.session-token";

/** Mint a real Auth.js session cookie so verifyAuth() resolves this user. */
export async function authCookie(userId: string): Promise<string> {
  const token = await encode({
    salt: COOKIE_NAME,
    secret: testEnv.AUTH_SECRET!,
    token: { sub: userId, name: "Test User", email: "test@local" },
  });
  return `${COOKIE_NAME}=${token}`;
}

export async function makeUser(
  email = `u-${Math.random().toString(36).slice(2)}@test.local`,
) {
  const [u] = await db.insert(users).values({ email, name: "Test" }).returning();
  return u!;
}

export async function makeProject(ownerId: string, allowedOrigins: string[] = []) {
  const [p] = await db
    .insert(projects)
    .values({ ownerId, name: "Test Project", key: generateProjectKey(), allowedOrigins })
    .returning();
  return p!;
}

export async function makeIssue(
  projectId: string,
  over: Partial<typeof issues.$inferInsert> = {},
) {
  const [i] = await db
    .insert(issues)
    .values({
      projectId,
      screenshotKey: `${projectId}/issue/screenshot.png`,
      region: { x: 0, y: 0, width: 10, height: 10 },
      metadata: {
        url: "http://host/app",
        title: "App",
        viewport: { width: 1, height: 1 },
        devicePixelRatio: 1,
        userAgent: "x",
        language: "en",
        timezone: "UTC",
        consoleErrors: [],
      },
      ...over,
    })
    .returning();
  return i!;
}
