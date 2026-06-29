import type { Issue, Project } from "@brainbox/shared";

import { issues, projects } from "../db/schema/index.ts";
import type { Storage } from "../storage/index.ts";

type IssueRow = typeof issues.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;

/** Map a DB issue row → the shared Issue, minting file URLs via storage. */
export async function toIssue(row: IssueRow, storage: Storage): Promise<Issue> {
  const screenshot = {
    key: row.screenshotKey,
    url: await storage.presignGet(row.screenshotKey),
  };
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
    audio,
    region: row.region,
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
