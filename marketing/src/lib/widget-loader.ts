export interface WidgetConfig {
  project: string;
  endpoint: string;
  src: string;
}

export interface WidgetEnv {
  VITE_DEMO_PROJECT_KEY?: string;
  VITE_DEMO_ENDPOINT?: string;
  VITE_DEMO_WIDGET_SRC?: string;
}

// The landing page's own demo inbox. Project keys are public by design -
// they ship in every customer's HTML. Env vars override for local testing
// against a seeded backend (pk_test_local / http://localhost:8787/ingest).
const DEMO_PROJECT_KEY = "pk_yWR707i0q2UwsCMc0WOkRL1A";
const DEMO_ENDPOINT = "https://app.brainbox.sh/ingest";

// The same URL customers paste (dashboard/src/lib/snippet.ts). Loading it
// cross-origin rather than bundling a copy into public/ means the landing page
// dogfoods the real install path and picks up widget releases from the box
// deploy - no marketing rebuild needed. Override to /widget.js to develop
// against a locally built bundle (`pnpm dev` copies one into public/).
const WIDGET_SRC = "https://app.brainbox.sh/widget.js";

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
    src: env.VITE_DEMO_WIDGET_SRC ?? WIDGET_SRC,
  };
}

/** Inject the widget script tag once. Safe under StrictMode double-effects. */
export function loadWidget(config: WidgetConfig): void {
  if (document.querySelector("script[data-brainbox-demo]")) return;
  const script = document.createElement("script");
  // Classic script (not type=module) so the widget sees document.currentScript.
  script.src = config.src;
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
