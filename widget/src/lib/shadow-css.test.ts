import { describe, expect, it } from "vitest";
import { shadowCss } from "./shadow-css.ts";

describe("shadowCss", () => {
  it("retargets :root at :host, since :root never matches in a shadow tree", () => {
    expect(shadowCss(":root{--a:1}")).toContain(":host{--a:1}");
    expect(shadowCss(":root{--a:1}")).not.toContain(":root");
  });

  it("replays a registered property's initial value on a universal selector", () => {
    const out = shadowCss(`@property --tw-translate-y{syntax:"*";inherits:false;initial-value:0}`);
    expect(out).toContain("--tw-translate-y:0");
    expect(out).toContain("*,::before,::after,::backdrop");
  });

  it("spells a property with no initial-value as `initial`", () => {
    const out = shadowCss(`@property --tw-font-weight{syntax:"*";inherits:false}`);
    expect(out).toContain("--tw-font-weight:initial");
  });

  it("carries every registered property across", () => {
    const out = shadowCss(
      `@property --a{syntax:"*";inherits:false;initial-value:0}` +
        `@property --b{syntax:"*";inherits:false;initial-value:1}` +
        `@property --c{syntax:"*";inherits:false;initial-value:solid}`,
    );
    expect(out).toContain("--a:0");
    expect(out).toContain("--b:1");
    expect(out).toContain("--c:solid");
  });

  it("puts the fallback in the lowest layer so utilities still beat it", () => {
    const out = shadowCss(`@property --tw-scale-x{syntax:"*";inherits:false;initial-value:1}`);
    expect(out).toContain("@layer properties{*,::before,::after,::backdrop{");
  });

  it("keeps the original css intact", () => {
    const css = `.a{color:red}@property --x{syntax:"*";inherits:false;initial-value:0}.b{color:blue}`;
    const out = shadowCss(css);
    expect(out).toContain(".a{color:red}");
    expect(out).toContain(".b{color:blue}");
  });

  it("adds nothing when there is no @property to replay", () => {
    expect(shadowCss(".a{color:red}")).toBe(".a{color:red}");
  });
});
