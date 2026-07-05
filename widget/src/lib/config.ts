import type { TriggerMode, WidgetTheme } from "@brainbox/shared";
import type { Position } from "./position.ts";

export interface WidgetConfig {
  projectKey: string;
  endpoint: string;
  /** "floating" = our own launcher; "manual" = the host's `[data-brainbox-trigger]`. */
  trigger: TriggerMode;
  theme: WidgetTheme;
  position: Position;
}

const POSITIONS: Position[] = ["bottom-right", "bottom-left", "top-right", "top-left"];
const THEMES: WidgetTheme[] = ["light", "dark", "auto"];

/** Parse the widget config off the embedding <script> tag's data-* attributes. */
export function readConfig(script: HTMLScriptElement | null): WidgetConfig | null {
  const ds = script?.dataset;
  const projectKey = ds?.project;
  const endpoint = ds?.endpoint;
  if (!projectKey || !endpoint) return null;

  const theme = ds.theme as WidgetTheme | undefined;
  const position = ds.position as Position | undefined;
  return {
    projectKey,
    endpoint,
    trigger: ds.trigger === "manual" ? "manual" : "floating",
    theme: theme && THEMES.includes(theme) ? theme : "dark",
    position: position && POSITIONS.includes(position) ? position : "bottom-right",
  };
}
