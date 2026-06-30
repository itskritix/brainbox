/** A project's public key, embedded in the widget snippet (`data-project`). */
export type ProjectKey = `pk_${string}`;

/** How the widget is opened. `floating` renders our FAB; `manual` is the
 *  customer's own element via `Brainbox.open()` or `[data-brainbox-trigger]`. */
export type TriggerMode = "floating" | "manual";

/** A customer's project as rendered in the dashboard. */
export interface Project {
  id: string;
  name: string;
  key: ProjectKey;
  allowedOrigins: string[];
  createdAt: string; // ISO 8601
}
