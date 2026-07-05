import { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Identity } from "@brainbox/shared";
import { App } from "./App.tsx";
import { readConfig } from "./lib/config.ts";
import { installCapture, setIdentity } from "./lib/metadata.ts";
import { watchTheme } from "./lib/theme.ts";
import { installTriggerDelegation } from "./lib/trigger.ts";
import css from "./index.css?inline";

// Captured at eval time - for a classic <script src> this is the embedding tag.
// Module scripts (dev harness) leave it null, so we fall back to a query below.
const currentScript = document.currentScript as HTMLScriptElement | null;

// Window events for host pages: "brainbox:open" / "brainbox:close" (fired by the
// api below) and "brainbox:submitted" ({ detail: { id } }) after a successful submit.
const api = {
  identify(identity: Identity) {
    setIdentity(identity);
  },
  open() {
    window.dispatchEvent(new CustomEvent("brainbox:open"));
  },
  close() {
    window.dispatchEvent(new CustomEvent("brainbox:close"));
  },
};

declare global {
  interface Window {
    Brainbox: typeof api;
  }
}
window.Brainbox = api;

function findScript(): HTMLScriptElement | null {
  return (
    currentScript ??
    document.querySelector<HTMLScriptElement>("script[data-project][data-endpoint]")
  );
}

function mount() {
  const config = readConfig(findScript());
  if (!config) {
    console.error("[brainbox] missing data-project or data-endpoint on the script tag");
    return;
  }

  installCapture();

  const host = document.createElement("div");
  host.id = "brainbox-widget";
  // keep the widget's own UI out of rrweb session recordings (session.ts blockClass)
  host.classList.add("rr-block");
  host.style.position = "relative";
  host.style.zIndex = "2147483647";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  // `:root` never matches inside a shadow tree - retarget the token vars to :host.
  style.textContent = css.replaceAll(":root", ":host");
  shadow.appendChild(style);

  const container = document.createElement("div");
  container.className = "bb-root";
  shadow.appendChild(container);

  // classList.toggle (not className=) so bb-root survives live "auto" flips.
  watchTheme(
    config.theme,
    window.matchMedia?.("(prefers-color-scheme: dark)") ?? null,
    (resolved) => container.classList.toggle("dark", resolved === "dark"),
  );

  // Always wired, regardless of trigger mode - "manual" only hides our FAB.
  // A trigger click before React mounts is dropped, same sub-frame race as a
  // too-early Brainbox.open(); accepted.
  installTriggerDelegation(document, () => api.open());

  createRoot(container).render(createElement(App, { config, hostEl: host }));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
