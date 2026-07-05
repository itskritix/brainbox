import { describe, expect, it } from "vitest";

import { snippetFor, WIDGET_SRC } from "./snippet";

describe("snippetFor", () => {
  it("builds a script tag scoped to the project key and endpoint", () => {
    const snippet = snippetFor("pk_abc123", "https://api.example.com/ingest");
    expect(snippet).toBe(
      `<script src="${WIDGET_SRC}" data-project="pk_abc123" data-endpoint="https://api.example.com/ingest"></script>`,
    );
  });

  it("omits options matching the widget defaults", () => {
    const snippet = snippetFor("pk_a", "e", {
      theme: "dark",
      trigger: "floating",
      position: "bottom-right",
    });
    expect(snippet).toBe(snippetFor("pk_a", "e"));
  });

  it("emits data-theme for a non-default theme", () => {
    expect(snippetFor("pk_a", "e", { theme: "auto" })).toBe(
      `<script src="${WIDGET_SRC}" data-project="pk_a" data-endpoint="e" data-theme="auto"></script>`,
    );
  });

  it("emits data-trigger for a manual trigger", () => {
    expect(snippetFor("pk_a", "e", { trigger: "manual" })).toBe(
      `<script src="${WIDGET_SRC}" data-project="pk_a" data-endpoint="e" data-trigger="manual"></script>`,
    );
  });

  it("emits data-position for a non-default position", () => {
    expect(snippetFor("pk_a", "e", { position: "top-left" })).toBe(
      `<script src="${WIDGET_SRC}" data-project="pk_a" data-endpoint="e" data-position="top-left"></script>`,
    );
  });

  it("emits combined options in a stable order", () => {
    expect(snippetFor("pk_a", "e", { theme: "light", trigger: "manual" })).toBe(
      `<script src="${WIDGET_SRC}" data-project="pk_a" data-endpoint="e" data-theme="light" data-trigger="manual"></script>`,
    );
  });
});
