import { afterEach, describe, expect, it, vi } from "vitest";
import { loadWidget, onWidgetSubmitted, resolveWidgetConfig } from "./widget-loader.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("resolveWidgetConfig", () => {
  it("falls back to the demo project and prod ingest endpoint", () => {
    const config = resolveWidgetConfig({});
    expect(config.project).toMatch(/^pk_/);
    expect(config.endpoint).toBe("https://app.brainbox.sh/ingest");
  });

  it("lets env values override the defaults", () => {
    const config = resolveWidgetConfig({
      VITE_DEMO_PROJECT_KEY: "pk_test_local",
      VITE_DEMO_ENDPOINT: "http://localhost:8787/ingest",
    });
    expect(config.project).toBe("pk_test_local");
    expect(config.endpoint).toBe("http://localhost:8787/ingest");
  });
});

describe("loadWidget", () => {
  const config = { project: "pk_a", endpoint: "http://x/ingest" };

  it("injects a classic script tag with the widget config", () => {
    loadWidget(config);
    const script = document.querySelector<HTMLScriptElement>("script[data-brainbox-demo]")!;
    expect(script.getAttribute("src")).toBe("/widget.js");
    expect(script.dataset.project).toBe("pk_a");
    expect(script.dataset.endpoint).toBe("http://x/ingest");
    expect(script.dataset.theme).toBe("dark");
    expect(script.type).toBe("");
  });

  it("is idempotent across repeat calls (StrictMode double-effect)", () => {
    loadWidget(config);
    loadWidget(config);
    expect(document.querySelectorAll("script[data-brainbox-demo]")).toHaveLength(1);
  });
});

describe("onWidgetSubmitted", () => {
  it("invokes the callback with the submitted issue id", () => {
    const cb = vi.fn();
    const cleanup = onWidgetSubmitted(cb);
    window.dispatchEvent(new CustomEvent("brainbox:submitted", { detail: { id: "abc" } }));
    cleanup();
    expect(cb).toHaveBeenCalledExactlyOnceWith("abc");
  });

  it("stops listening after cleanup", () => {
    const cb = vi.fn();
    const cleanup = onWidgetSubmitted(cb);
    cleanup();
    window.dispatchEvent(new CustomEvent("brainbox:submitted", { detail: { id: "abc" } }));
    expect(cb).not.toHaveBeenCalled();
  });

  it("ignores malformed events without an id", () => {
    const cb = vi.fn();
    const cleanup = onWidgetSubmitted(cb);
    window.dispatchEvent(new CustomEvent("brainbox:submitted"));
    window.dispatchEvent(new CustomEvent("brainbox:submitted", { detail: { id: 7 } }));
    cleanup();
    expect(cb).not.toHaveBeenCalled();
  });
});
