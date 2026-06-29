import type { CapturedMetadata } from "./metadata.ts";
import type { Region } from "./region.ts";

/** A stored R2 object: its key, plus an optional short-lived presigned URL the
 *  dashboard uses to display it. */
export interface StoredFile {
  key: string;
  url?: string;
}

/** A feedback submission as stored by the backend and rendered by the dashboard.
 *  `createdAt` is an ISO 8601 string for serialization safety across the wire. */
export interface Issue {
  id: string;
  projectId: string;
  createdAt: string;
  text?: string;
  screenshot: StoredFile;
  audio?: StoredFile & { mime: string };
  region: Region;
  metadata: CapturedMetadata;
}
