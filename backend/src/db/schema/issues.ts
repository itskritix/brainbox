import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { CapturedMetadata, Region } from "@brainbox/shared";

import { projects } from "./projects.ts";

// jsonb columns are typed straight from the @brainbox/shared contract — this is
// the first cross-package consumer of the shared types.
//
// DB ↔ shared `Issue` seam (handled at the API boundary in step 5, not here):
//   - `createdAt` is a JS Date → `.toISOString()` for the API response.
//   - flat `screenshotKey`/`audioKey`/`audioMime` compose into the shared
//     `Issue.screenshot` / `Issue.audio` objects (+ presigned `url` once R2 lands).
//   - `region` / `metadata` jsonb pass through 1:1.
export const issues = pgTable("issues", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  text: text("text"),
  // A submission is a screenshot OR a screen recording — so screenshot_key,
  // crop_key and region are all nullable (recordings have none of them).
  screenshotKey: text("screenshot_key"),
  // Auto-generated crop of the highlighted region (null if cropping failed).
  cropKey: text("crop_key"),
  // Screen recording (webm video with mic audio).
  videoKey: text("video_key"),
  videoMime: text("video_mime"),
  audioKey: text("audio_key"),
  audioMime: text("audio_mime"),
  region: jsonb("region").$type<Region>(),
  metadata: jsonb("metadata").$type<CapturedMetadata>().notNull(),
});
