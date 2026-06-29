import type { CapturedMetadata } from "./metadata.ts";
import type { ProjectKey } from "./project.ts";
import type { Region } from "./region.ts";

/** The structured (JSON) part of the widget's multipart `/ingest` POST.
 *  The screenshot and audio travel as separate binary file parts and are
 *  intentionally NOT in this type. */
export interface FeedbackPayload {
  projectKey: ProjectKey;
  region: Region;
  text?: string;
  metadata: CapturedMetadata;
}
