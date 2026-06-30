import type { Position } from "./position.ts";

export interface WidgetConfig {
  projectKey: string;
  endpoint: string;
  /** "float" = our own floating launcher; "mount" = host renders its own trigger. */
  mode: "float" | "mount";
  mount?: string;
  position: Position;
}

const POSITIONS: Position[] = ["bottom-right", "bottom-left", "top-right", "top-left"];

/** Parse the widget config off the embedding <script> tag's data-* attributes. */
export function readConfig(script: HTMLScriptElement | null): WidgetConfig | null {
  const ds = script?.dataset;
  const projectKey = ds?.project;
  const endpoint = ds?.endpoint;
  if (!projectKey || !endpoint) return null;

  const position = ds.position as Position | undefined;
  return {
    projectKey,
    endpoint,
    mode: ds.mode === "mount" ? "mount" : "float",
    mount: ds.mount,
    position: position && POSITIONS.includes(position) ? position : "bottom-right",
  };
}
