export const WIDGET_SRC = "https://app.brainbox.sh/widget.js";

/** The one-line install tag a customer pastes before `</body>`. */
export function snippetFor(projectKey: string, endpoint: string): string {
  return `<script src="${WIDGET_SRC}" data-project="${projectKey}" data-endpoint="${endpoint}"></script>`;
}
