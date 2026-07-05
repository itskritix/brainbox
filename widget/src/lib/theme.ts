import type { WidgetTheme } from "@brainbox/shared";

export type ResolvedTheme = "light" | "dark";

/** Narrowed MediaQueryList so tests can pass a fake (jsdom has no matchMedia). */
export type ThemeQuery = Pick<MediaQueryList, "matches" | "addEventListener" | "removeEventListener">;

export function resolveTheme(theme: WidgetTheme, prefersDark: boolean): ResolvedTheme {
  if (theme === "auto") return prefersDark ? "dark" : "light";
  return theme;
}

/**
 * Apply the resolved theme now and, for "auto", keep applying it as the OS
 * preference changes. Returns a cleanup; in prod the widget lives for the
 * page lifetime so it's never called - tests exercise it.
 */
export function watchTheme(
  theme: WidgetTheme,
  mql: ThemeQuery | null,
  apply: (resolved: ResolvedTheme) => void,
): () => void {
  apply(resolveTheme(theme, mql?.matches ?? false));
  if (theme !== "auto" || !mql) return () => {};

  const onChange = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}
