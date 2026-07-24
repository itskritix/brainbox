import { describe, expect, it } from "vitest";
import { isToday, normalizeOrigin, timeAgo, userInitial } from "./utils.ts";

describe("isToday", () => {
  const noon = new Date("2026-07-24T12:00:00");

  it("is true for the same local calendar day", () => {
    expect(isToday(new Date("2026-07-24T00:30:00").toISOString(), noon)).toBe(true);
    expect(isToday(new Date("2026-07-24T23:00:00").toISOString(), noon)).toBe(true);
  });

  it("is false for yesterday even when less than 24h ago", () => {
    expect(isToday(new Date("2026-07-23T23:00:00").toISOString(), noon)).toBe(false);
  });

  it("is false across month and year boundaries", () => {
    expect(isToday(new Date("2026-06-24T12:00:00").toISOString(), noon)).toBe(false);
    expect(isToday(new Date("2025-07-24T12:00:00").toISOString(), noon)).toBe(false);
  });
});

describe("userInitial", () => {
  it("uses the first letter of the name, uppercased", () => {
    expect(userInitial("ganesh", "ganesh@nidana.io")).toBe("G");
  });

  it("falls back to the email when the name is missing or blank", () => {
    expect(userInitial(null, "ganesh@nidana.io")).toBe("G");
    expect(userInitial("   ", "alice@example.com")).toBe("A");
  });

  it('renders "?" when neither is present', () => {
    expect(userInitial(null, undefined)).toBe("?");
    expect(userInitial("", "")).toBe("?");
  });
});

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

  it('falls back to "Jul 5"-style past a week, adding the year when it differs', () => {
    const iso = isoAgo(10 * 24 * 60 * 60);
    const sameYear = new Date(iso).getFullYear() === new Date().getFullYear();
    expect(timeAgo(iso)).toBe(
      new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(sameYear ? {} : { year: "numeric" }),
      }),
    );
    const old = isoAgo(3 * 365 * 24 * 60 * 60);
    expect(timeAgo(old)).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });
});
