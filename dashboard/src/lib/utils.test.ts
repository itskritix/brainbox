import { describe, expect, it } from "vitest";
import { normalizeOrigin, timeAgo } from "./utils.ts";

describe("normalizeOrigin", () => {
  it("adds https and lowercases a bare domain", () => {
    expect(normalizeOrigin("MyApp.com")).toBe("https://myapp.com");
  });

  it("strips a path down to the origin", () => {
    expect(normalizeOrigin("myapp.com/path")).toBe("https://myapp.com");
  });

  it("keeps an explicit scheme and port", () => {
    expect(normalizeOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("returns null for empty or whitespace input", () => {
    expect(normalizeOrigin("")).toBeNull();
    expect(normalizeOrigin("   ")).toBeNull();
  });

  it("returns null for unparseable garbage", () => {
    expect(normalizeOrigin("http://")).toBeNull();
  });
});

describe("timeAgo", () => {
  const isoAgo = (seconds: number) => new Date(Date.now() - seconds * 1000).toISOString();

  it('renders "just now" under a minute', () => {
    expect(timeAgo(isoAgo(30))).toBe("just now");
  });

  it("renders minutes ago", () => {
    expect(timeAgo(isoAgo(5 * 60))).toBe("5m ago");
  });

  it("renders hours ago", () => {
    expect(timeAgo(isoAgo(3 * 60 * 60))).toBe("3h ago");
  });

  it("renders days ago", () => {
    expect(timeAgo(isoAgo(2 * 24 * 60 * 60))).toBe("2d ago");
  });

  it("falls back to a locale date past a week", () => {
    const iso = isoAgo(10 * 24 * 60 * 60);
    expect(timeAgo(iso)).toBe(new Date(iso).toLocaleDateString());
  });
});
