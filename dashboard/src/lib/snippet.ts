import type { TriggerMode, WidgetPosition, WidgetTheme } from "@brainbox/shared";

export const WIDGET_SRC = "https://app.brainbox.sh/widget.js";

export interface SnippetOptions {
  theme?: WidgetTheme;
  trigger?: TriggerMode;
  position?: WidgetPosition;
}

/** The host-side markup for a manual trigger, shown next to the snippet. */
export const MANUAL_TRIGGER_EXAMPLE = `<button data-brainbox-trigger>Feedback</button>`;

/** The one-line install tag a customer pastes before `</body>`.
 *  Widget defaults (dark / floating / bottom-right) are omitted so the
 *  default snippet stays minimal. */
export function snippetFor(
  projectKey: string,
  endpoint: string,
  options: SnippetOptions = {},
): string {
  let attrs = `data-project="${projectKey}" data-endpoint="${endpoint}"`;
  if (options.theme && options.theme !== "dark") attrs += ` data-theme="${options.theme}"`;
  if (options.trigger && options.trigger !== "floating")
    attrs += ` data-trigger="${options.trigger}"`;
  if (options.position && options.position !== "bottom-right")
    attrs += ` data-position="${options.position}"`;
  return `<script src="${WIDGET_SRC}" ${attrs}></script>`;
}
