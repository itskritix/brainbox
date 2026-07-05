import { describe, expect, it, vi } from "vitest";
import { resolveTheme, watchTheme, type ThemeQuery } from "./theme.ts";

function fakeQuery(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql: ThemeQuery = {
    matches,
    addEventListener: vi.fn((_type, cb) => {
      listeners.add(cb as (e: MediaQueryListEvent) => void);
    }),
    removeEventListener: vi.fn((_type, cb) => {
      listeners.delete(cb as (e: MediaQueryListEvent) => void);
    }),
  };
  const fire = (nowMatches: boolean) => {
    for (const cb of listeners) cb({ matches: nowMatches } as MediaQueryListEvent);
  };
  return { mql, fire };
}

describe("resolveTheme", () => {
  it("passes light and dark through regardless of preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("resolves auto from the preference", () => {
    expect(resolveTheme("auto", true)).toBe("dark");
    expect(resolveTheme("auto", false)).toBe("light");
  });
});

describe("watchTheme", () => {
  it("applies an explicit theme immediately and never subscribes", () => {
    const { mql } = fakeQuery(true);
    const apply = vi.fn();
    watchTheme("light", mql, apply);
    expect(apply).toHaveBeenCalledExactlyOnceWith("light");
    expect(mql.addEventListener).not.toHaveBeenCalled();
  });

  it("resolves auto from the query and follows changes", () => {
    const { mql, fire } = fakeQuery(true);
    const apply = vi.fn();
    watchTheme("auto", mql, apply);
    expect(apply).toHaveBeenLastCalledWith("dark");
    fire(false);
    expect(apply).toHaveBeenLastCalledWith("light");
    fire(true);
    expect(apply).toHaveBeenLastCalledWith("dark");
  });

  it("stops following changes after cleanup", () => {
    const { mql, fire } = fakeQuery(false);
    const apply = vi.fn();
    const cleanup = watchTheme("auto", mql, apply);
    cleanup();
    fire(true);
    expect(apply).toHaveBeenCalledExactlyOnceWith("light");
    expect(mql.removeEventListener).toHaveBeenCalledOnce();
  });

  it("treats auto without matchMedia as light and does not crash", () => {
    const apply = vi.fn();
    const cleanup = watchTheme("auto", null, apply);
    expect(apply).toHaveBeenCalledExactlyOnceWith("light");
    cleanup();
  });
});
