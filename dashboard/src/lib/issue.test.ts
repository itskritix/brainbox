import { describe, expect, it } from "vitest";
import type { CapturedMetadata } from "@brainbox/shared";

import { formatClock, issueTitle, pageLabel } from "./issue";

function meta(overrides: Partial<CapturedMetadata> = {}): CapturedMetadata {
  return {
    url: "https://app.example.com/billing",
    title: "Billing — Example",
    viewport: { width: 1280, height: 720 },
    devicePixelRatio: 2,
    userAgent: "test",
    language: "en-US",
    timezone: "UTC",
    consoleErrors: [],
    ...overrides,
  };
}

describe("issueTitle", () => {
  it("prefers the end-user's note", () => {
    expect(issueTitle({ text: "  The save button is dead  ", metadata: meta() })).toBe(
      "The save button is dead",
    );
  });

  it("falls back to the page label when there is no note", () => {
    expect(issueTitle({ metadata: meta() })).toBe("app.example.com/billing");
  });

  it("falls back to the page title when the URL is empty", () => {
    expect(issueTitle({ metadata: meta({ url: "" }) })).toBe("Billing — Example");
  });
});

describe("pageLabel", () => {
  it("strips scheme and keeps host + path", () => {
    expect(pageLabel("https://app.example.com/settings?tab=team")).toBe(
      "app.example.com/settings",
    );
  });

  it("drops the trailing slash for the root path", () => {
    expect(pageLabel("https://app.example.com/")).toBe("app.example.com");
  });

  it("returns the input when unparseable", () => {
    expect(pageLabel("not a url")).toBe("not a url");
  });
});

describe("formatClock", () => {
  it("formats m:ss", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(83000)).toBe("1:23");
    expect(formatClock(600000)).toBe("10:00");
  });

  it("clamps negatives to zero", () => {
    expect(formatClock(-500)).toBe("0:00");
  });
});
