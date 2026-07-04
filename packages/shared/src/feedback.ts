import type { CapturedMetadata } from "./metadata.ts";
import type { ProjectKey } from "./project.ts";
import type { Region } from "./region.ts";

/** The structured (JSON) part of the widget's multipart `/ingest` POST.
 *  The screenshot / video / audio travel as separate binary file parts and are
 *  intentionally NOT in this type.
 *
 *  A submission is either a **screenshot** (with a highlighted `region`) or a
 *  **screen recording** (a video, no region) - so `region` is optional. */
export interface FeedbackPayload {
  projectKey: ProjectKey;
  region?: Region;
  text?: string;
  metadata: CapturedMetadata;
}
