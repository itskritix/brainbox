import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { db } from "../db/client.ts";
import { issues, projects } from "../db/schema/index.ts";
import { env } from "../env.ts";
import { getStorage } from "../storage/index.ts";
import { feedbackSchema } from "../validation/feedback.ts";

const AUDIO_EXT: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

export const ingest = new Hono();

// Public: called cross-origin from arbitrary customer sites, no cookies. The
// per-project origin allowlist is enforced in the handler (not via CORS).
ingest.use("*", cors({ origin: (origin) => origin ?? "*", credentials: false }));

ingest.post("/", async (c) => {
  const body = await c.req.parseBody();

  // --- structured json part ---
  const jsonRaw = body["json"];
  if (typeof jsonRaw !== "string") {
    return c.json({ error: "Missing json part" }, 400);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonRaw);
  } catch {
    return c.json({ error: "Invalid json" }, 400);
  }
  const result = feedbackSchema.safeParse(parsed);
  if (!result.success) {
    return c.json({ error: "Invalid payload", issues: result.error.issues }, 400);
  }
  const feedback = result.data;

  // --- project key ---
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.key, feedback.projectKey))
    .limit(1);
  if (!project) return c.json({ error: "Unknown project key" }, 401);

  // --- origin allowlist (empty = allow all; absent Origin, e.g. curl = allow) ---
  const origin = c.req.header("origin");
  if (
    origin &&
    project.allowedOrigins.length > 0 &&
    !project.allowedOrigins.includes(origin)
  ) {
    return c.json({ error: "Origin not allowed" }, 403);
  }

  // --- screenshot (required) ---
  const screenshot = body["screenshot"];
  if (!(screenshot instanceof File)) {
    return c.json({ error: "Missing screenshot" }, 400);
  }
  if (!screenshot.type.startsWith("image/")) {
    return c.json({ error: "screenshot must be an image" }, 400);
  }
  if (screenshot.size > env.MAX_SCREENSHOT_BYTES) {
    return c.json({ error: "screenshot too large" }, 413);
  }

  // --- audio (optional) ---
  const audioField = body["audio"];
  const audio = audioField instanceof File ? audioField : undefined;
  if (audio) {
    if (!audio.type.startsWith("audio/")) {
      return c.json({ error: "audio must be an audio file" }, 400);
    }
    if (audio.size > env.MAX_AUDIO_BYTES) {
      return c.json({ error: "audio too large" }, 413);
    }
  }

  // --- store + persist ---
  const issueId = crypto.randomUUID();
  const storage = getStorage();

  const screenshotKey = `${project.id}/${issueId}/screenshot.png`;
  await storage.put(
    screenshotKey,
    new Uint8Array(await screenshot.arrayBuffer()),
    screenshot.type,
  );

  let audioKey: string | null = null;
  let audioMime: string | null = null;
  if (audio) {
    const ext = AUDIO_EXT[audio.type] ?? "bin";
    audioKey = `${project.id}/${issueId}/audio.${ext}`;
    audioMime = audio.type;
    await storage.put(
      audioKey,
      new Uint8Array(await audio.arrayBuffer()),
      audio.type,
    );
  }

  await db.insert(issues).values({
    id: issueId,
    projectId: project.id,
    text: feedback.text ?? null,
    screenshotKey,
    audioKey,
    audioMime,
    region: feedback.region,
    metadata: feedback.metadata,
  });

  return c.json({ id: issueId }, 201);
});
