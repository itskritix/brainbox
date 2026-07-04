import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { db } from "../db/client.ts";
import { issues, projects } from "../db/schema/index.ts";
import { env } from "../env.ts";
import { cropRegion } from "../lib/crop.ts";
import { transcribeAudio, transcriptionEnabled } from "../lib/transcription.ts";
import { getStorage } from "../storage/index.ts";
import { feedbackSchema } from "../validation/feedback.ts";

const AUDIO_EXT: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

const VIDEO_EXT: Record<string, string> = {
  "video/webm": "webm",
  "video/mp4": "mp4",
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

  // --- capture: a screenshot OR a screen recording (video) ---
  const screenshotField = body["screenshot"];
  const screenshot = screenshotField instanceof File ? screenshotField : undefined;
  if (screenshot) {
    if (!screenshot.type.startsWith("image/")) {
      return c.json({ error: "screenshot must be an image" }, 400);
    }
    if (screenshot.size > env.MAX_SCREENSHOT_BYTES) {
      return c.json({ error: "screenshot too large" }, 413);
    }
  }

  const videoField = body["video"];
  const video = videoField instanceof File ? videoField : undefined;
  if (video) {
    if (!video.type.startsWith("video/")) {
      return c.json({ error: "video must be a video file" }, 400);
    }
    if (video.size > env.MAX_VIDEO_BYTES) {
      return c.json({ error: "video too large" }, 413);
    }
  }

  // Session replay: a gzipped rrweb event log (application/gzip or application/json).
  const sessionField = body["session"];
  const session = sessionField instanceof File ? sessionField : undefined;
  if (session && session.size > env.MAX_SESSION_BYTES) {
    return c.json({ error: "session too large" }, 413);
  }

  if (!screenshot && !video && !session) {
    return c.json({ error: "Missing screenshot, video or session" }, 400);
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

  let screenshotKey: string | null = null;
  let cropKey: string | null = null;
  if (screenshot) {
    const screenshotBytes = new Uint8Array(await screenshot.arrayBuffer());
    screenshotKey = `${project.id}/${issueId}/screenshot.png`;
    await storage.put(screenshotKey, screenshotBytes, screenshot.type);

    // Auto-crop the highlighted region into a second image (best-effort).
    if (feedback.region) {
      try {
        const cropBytes = await cropRegion(screenshotBytes, feedback.region);
        if (cropBytes) {
          cropKey = `${project.id}/${issueId}/crop.png`;
          await storage.put(cropKey, cropBytes, "image/png");
        }
      } catch (err) {
        console.error("[ingest] region crop failed:", err);
      }
    }
  }

  let videoKey: string | null = null;
  let videoMime: string | null = null;
  if (video) {
    const ext = VIDEO_EXT[video.type] ?? "webm";
    videoKey = `${project.id}/${issueId}/recording.${ext}`;
    videoMime = video.type;
    await storage.put(videoKey, new Uint8Array(await video.arrayBuffer()), video.type);
  }

  let sessionKey: string | null = null;
  if (session) {
    const gz = session.type.includes("gzip");
    sessionKey = `${project.id}/${issueId}/session.json${gz ? ".gz" : ""}`;
    await storage.put(sessionKey, new Uint8Array(await session.arrayBuffer()), session.type);
  }

  let audioKey: string | null = null;
  let audioMime: string | null = null;
  let audioBytes: Uint8Array | null = null;
  if (audio) {
    const ext = AUDIO_EXT[audio.type] ?? "bin";
    audioKey = `${project.id}/${issueId}/audio.${ext}`;
    audioMime = audio.type;
    audioBytes = new Uint8Array(await audio.arrayBuffer());
    await storage.put(audioKey, audioBytes, audio.type);
  }

  const willTranscribe = audioBytes !== null && transcriptionEnabled();

  await db.insert(issues).values({
    id: issueId,
    projectId: project.id,
    text: feedback.text ?? null,
    screenshotKey,
    cropKey,
    videoKey,
    videoMime,
    sessionKey,
    audioKey,
    audioMime,
    audioTranscriptStatus: willTranscribe ? "pending" : null,
    region: feedback.region ?? null,
    metadata: feedback.metadata,
  });

  // Fire-and-forget: transcription must never delay or fail the submission.
  if (audioBytes && willTranscribe) {
    void transcribeAndStore(issueId, audioBytes);
  }

  return c.json({ id: issueId }, 201);
});

async function transcribeAndStore(issueId: string, audio: Uint8Array): Promise<void> {
  try {
    const text = await transcribeAudio(audio);
    await db
      .update(issues)
      .set({ audioTranscript: text, audioTranscriptStatus: "done" })
      .where(eq(issues.id, issueId));
  } catch (err) {
    console.error(`[ingest] transcription failed for issue ${issueId}:`, err);
    await db
      .update(issues)
      .set({ audioTranscriptStatus: "failed" })
      .where(eq(issues.id, issueId))
      .catch((dbErr: unknown) => {
        console.error(`[ingest] failed to mark transcription failed for ${issueId}:`, dbErr);
      });
  }
}
