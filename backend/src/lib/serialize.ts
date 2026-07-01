import type { Issue, Project } from "@brainbox/shared";

import { issues, projects } from "../db/schema/index.ts";
import type { Storage } from "../storage/index.ts";

type IssueRow = typeof issues.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;

/** Map a DB issue row → the shared Issue, minting file URLs via storage. */
export async function toIssue(row: IssueRow, storage: Storage): Promise<Issue> {
  const screenshot = row.screenshotKey
    ? { key: row.screenshotKey, url: await storage.presignGet(row.screenshotKey) }
    : undefined;
  const crop = row.cropKey
    ? { key: row.cropKey, url: await storage.presignGet(row.cropKey) }
    : undefined;
  const video = row.videoKey
    ? {
        key: row.videoKey,
        url: await storage.presignGet(row.videoKey),
        mime: row.videoMime ?? "video/webm",
      }
    : undefined;
  const session = row.sessionKey
    ? { key: row.sessionKey, url: await storage.presignGet(row.sessionKey) }
    : undefined;
  const audio = row.audioKey
    ? {
        key: row.audioKey,
        url: await storage.presignGet(row.audioKey),
        mime: row.audioMime ?? "application/octet-stream",
      }
    : undefined;
  return {
    id: row.id,
    projectId: row.projectId,
    createdAt: row.createdAt.toISOString(),
    text: row.text ?? undefined,
    screenshot,
    crop,
    video,
    session,
    audio,
    region: row.region ?? undefined,
    metadata: row.metadata,
  };
}

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    allowedOrigins: row.allowedOrigins,
    createdAt: row.createdAt.toISOString(),
  };
}
