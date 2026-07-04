# 4. Resend-style design token system (Radix primitives + semantic layer)

Date: 2026-06-28

## Status

Accepted

## Context

We want every Brainbox surface (marketing, widget, dashboard) to look like one
product. We adopted Resend's published design system
(`resend.com/design` → `github.com/resend/design-skills`) as the basis.

Resend's system is two layers:

- **Primitives** - Radix Colors scales (`gray-1..12`, `red-a3`, …). Radix is
  public and free, so we can reproduce these exactly.
- **Semantic tokens** - intent-named roles (`bg-background`, `text-default`,
  `bg-brand`, `bg-error`, …) that map onto primitives. Components use these
  first; primitives are escape hatches.

Two constraints shaped the implementation:

1. The brand fonts are proprietary (ABC Favorit, Domaine; Commit Mono and Inter
   are free). We chose **Inter for sans + display, Commit Mono for code** - no
   licensing cost (see the fonts decision in the build session).
2. A single Tailwind v4 `--color-*` key cannot express `text-default` (gray-11)
   and `border-default` (gray-3) having *different* values under the same word
   "default". So the semantic layer can't be plain `@theme` colors.

We also decided **each repo owns its own copy** of the token files rather than a
shared workspace package, so a surface can be developed/deployed independently.
They stay consistent by copying the same canonical files.

## Decision

Implement the two layers in Tailwind v4 CSS, per surface:

- **`styles/primitives.css`** - `@import` the needed Radix Color CSS
  (`@radix-ui/colors`, light + dark + alpha), then expose them as Tailwind
  `@theme` colors (`bg-gray-2`, `text-red-a11`, …). Colored families are
  alpha-backed (`red-3` === `var(--red-a3)`), matching Resend.
- **`styles/tokens.css`** - the semantic layer as Tailwind v4 **`@utility`**
  definitions (`@utility text-default { color: var(--text-default) }`). Using
  `@utility` (not `@theme` colors) is what lets `text-default` and
  `border-default` differ. Theme-asymmetric roles (background, brand, on-brand,
  placeholder) are redefined under `.dark`; everything else flips automatically
  because it references Radix steps that already flip.
- **`index.css`** - imports both, sets fonts (Inter / Commit Mono), radii
  (`rounded-4xl`), shadows, and the brand signature utilities (gradient, sheen,
  glass, noise, grid).

Trade-off accepted: semantic `@utility` tokens do **not** support opacity
modifiers (`bg-brand/90`). This matches Resend's philosophy of explicit state
tokens (`bg-brand-hover`); where a faded value is genuinely needed, use a
primitive with opacity (`text-gray-11/70`) as the documented escape hatch.

## Consequences

- Real, recognized token values (Radix) - not invented ones. The previous
  bespoke shadcn-style tokens in marketing were replaced.
- New surfaces copy `primitives.css` + `tokens.css` + the `@radix-ui/colors`
  dependency to inherit the exact system.
- `text-default`/`border-default`-style collisions are expressible; opacity
  modifiers on semantic tokens are not (use explicit state tokens or primitives).
- See [docs/design-tokens.md](../design-tokens.md) for the adoption checklist and
  the full token reference.
