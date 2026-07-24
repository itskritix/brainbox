import { describe, expect, it } from "vitest";
import type { CapturedMetadata } from "@brainbox/shared";

import { formatClock, issueTitle, matchesIssue, newestFirst, pageLabel, pagePath } from "./issue";

describe("newestFirst", () => {
  it("sorts by createdAt descending without mutating the input", () => {
    const input = [
      { createdAt: "2026-07-01T10:00:00.000Z" },
      { createdAt: "2026-07-24T10:00:00.000Z" },
      { createdAt: "2026-07-05T10:00:00.000Z" },
    ];
    const sorted = newestFirst(input);
    expect(sorted.map((i) => i.createdAt.slice(8, 10))).toEqual(["24", "05", "01"]);
    expect(input[0]?.createdAt).toBe("2026-07-01T10:00:00.000Z");
  });
});

function meta(overrides: Partial<CapturedMetadata> = {}): CapturedMetadata {
  return {
    url: "https://app.example.com/billing",
    title: "Billing - Example",
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

  it("falls back to the document title when there is no note", () => {
    expect(issueTitle({ metadata: meta() })).toBe("Billing - Example");
  });

  it("falls back to the page label when the document title is empty", () => {
    expect(issueTitle({ metadata: meta({ title: "" }) })).toBe("app.example.com/billing");
  });

  it('renders "Untitled report" when nothing is available', () => {
    expect(issueTitle({ metadata: meta({ title: "", url: "" }) })).toBe("Untitled report");
  });
});

describe("pagePath", () => {
  it("returns just the path", () => {
    expect(pagePath("https://app.example.com/settings?tab=team")).toBe("/settings");
  });

  it("is empty for the root page", () => {
    expect(pagePath("https://app.example.com/")).toBe("");
  });

  it("is empty when unparseable", () => {
    expect(pagePath("not a url")).toBe("");
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

describe("matchesIssue", () => {
  const issue = {
    text: "The save button is dead",
    metadata: meta({ identity: { email: "dole777@gmail.com" } }),
  };

  it("matches the note case-insensitively", () => {
    expect(matchesIssue(issue, "SAVE button")).toBe(true);
  });

  it("matches the page label", () => {
    expect(matchesIssue(issue, "example.com/billing")).toBe(true);
  });

  it("matches the reporter email", () => {
    expect(matchesIssue(issue, "dole777")).toBe(true);
  });

  it("matches everything on an empty or whitespace query", () => {
    expect(matchesIssue(issue, "")).toBe(true);
    expect(matchesIssue(issue, "   ")).toBe(true);
  });

  it("rejects a query found nowhere", () => {
    expect(matchesIssue(issue, "checkout")).toBe(false);
  });

  it("survives a missing identity", () => {
    expect(matchesIssue({ metadata: meta() }, "billing")).toBe(true);
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
