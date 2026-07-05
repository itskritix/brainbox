export interface WidgetConfig {
  project: string;
  endpoint: string;
}

export interface WidgetEnv {
  VITE_DEMO_PROJECT_KEY?: string;
  VITE_DEMO_ENDPOINT?: string;
}

// The landing page's own demo inbox. Project keys are public by design -
// they ship in every customer's HTML. Env vars override for local testing
// against a seeded backend (pk_test_local / http://localhost:8787/ingest).
const DEMO_PROJECT_KEY = "pk_yWR707i0q2UwsCMc0WOkRL1A";
const DEMO_ENDPOINT = "https://app.brainbox.sh/ingest";

declare global {
  interface WindowEventMap {
    "brainbox:submitted": CustomEvent<{ id?: unknown }>;
  }
  interface Window {
    // Optional (unlike the widget's own declaration): the script loads async,
    // so callers must guard with `window.Brainbox?.open()`.
    Brainbox?: { open(): void; close(): void };
  }
}

export function resolveWidgetConfig(env: WidgetEnv): WidgetConfig {
  return {
    project: env.VITE_DEMO_PROJECT_KEY ?? DEMO_PROJECT_KEY,
    endpoint: env.VITE_DEMO_ENDPOINT ?? DEMO_ENDPOINT,
  };
}

/** Inject the widget script tag once. Safe under StrictMode double-effects. */
export function loadWidget(config: WidgetConfig): void {
  if (document.querySelector("script[data-brainbox-demo]")) return;
  const script = document.createElement("script");
  // Classic script (not type=module) so the widget sees document.currentScript.
  script.src = "/widget.js";
  script.dataset.brainboxDemo = "true";
  script.dataset.project = config.project;
  script.dataset.endpoint = config.endpoint;
  script.dataset.position = "bottom-right";
  document.body.appendChild(script);
}

/** Listen for successful widget submissions. Returns the cleanup function. */
export function onWidgetSubmitted(cb: (id: string) => void): () => void {
  const handler = (event: CustomEvent<{ id?: unknown }>) => {
    const id = event.detail === null ? undefined : event.detail.id;
    if (typeof id === "string") cb(id);
  };
  window.addEventListener("brainbox:submitted", handler);
  return () => window.removeEventListener("brainbox:submitted", handler);
}
