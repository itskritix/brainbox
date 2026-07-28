/**
 * Prepare the widget's stylesheet for injection into the shadow root.
 *
 * Two things the browser will not do for us inside a shadow tree:
 *
 * 1. `:root` never matches, so the design-token layer has to be retargeted at
 *    `:host`.
 *
 * 2. `@property` registration is **document-scoped**. Rules inside a shadow
 *    root's `<style>` are parsed and then ignored, so every custom property
 *    Tailwind registers there is left with no initial value.
 *
 *    That is not cosmetic. Tailwind v4 compiles transforms to
 *    `translate: var(--tw-translate-x) var(--tw-translate-y)`; with
 *    `--tw-translate-y` unregistered it resolves to the guaranteed-invalid
 *    value, which makes the whole declaration invalid at computed-value time
 *    and drops it. The result is `translate: none` - every `-translate-x-1/2`
 *    in the widget silently did nothing, so anything centred that way sat half
 *    its own width to the right.
 *
 *    Tailwind emits exactly the right fallback already, but behind an
 *    `@supports` that only matches browsers *lacking* `@property`. Chrome has
 *    it, so the guard is false - and Chrome still needs the fallback here.
 *    Re-declaring each registered property's initial value on a universal
 *    selector restores it.
 */
export function shadowCss(css: string): string {
  const defaults: string[] = [];

  // @property blocks contain no nested braces, so this stays a safe parse.
  for (const block of css.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)) {
    const name = block[1];
    if (!name) continue;
    const init = /initial-value:\s*([^;}]+)/.exec(block[2] ?? "");
    // No initial-value means "unset by design" - Tailwind's own fallback spells
    // that `initial`.
    defaults.push(`${name}:${init?.[1]?.trim() ?? "initial"}`);
  }

  const scoped = css.replaceAll(":root", ":host");
  if (defaults.length === 0) return scoped;

  // `properties` is Tailwind's lowest layer, so utilities still win over these.
  return `${scoped}\n@layer properties{*,::before,::after,::backdrop{${defaults.join(";")}}}`;
}
