# Brainbox design tokens

Based on Resend's design system (`github.com/resend/design-skills`). Two layers:
Radix **primitives** + a **semantic** layer. Use semantic tokens first;
primitives are escape hatches. See [ADR 0004](./adr/0004-resend-design-token-system.md)
for the rationale.

## Adopting in a new surface (widget, dashboard, …)

Each repo keeps its **own copy** - there is no shared package. To set up:

1. `pnpm add @radix-ui/colors`
2. Copy `marketing/src/styles/primitives.css` and `marketing/src/styles/tokens.css`.
3. In your entry CSS:
   ```css
   @import "tailwindcss";
   @import "./styles/primitives.css";
   @import "./styles/tokens.css";
   @custom-variant dark (&:is(.dark *));
   ```
4. Fonts: Inter (sans + display), Commit Mono (code). Dark mode via `.dark` on a
   root element (marketing sets it on `<html>`).

> Widget note: the widget renders inside a Shadow DOM (see ADR 0001), so the
> compiled token CSS must be injected into the shadow root, and `.dark` / the
> root vars must be set on the shadow host rather than `<html>`.

## Semantic tokens (use these first)

| Group | Tokens |
| --- | --- |
| Surfaces | `bg-background`, `bg-canvas`, `bg-subtle`, `bg-elevated` |
| Text | `text-emphasis`, `text-default`, `text-muted`, `text-placeholder`, `text-on-brand` |
| Borders | `border-default`, `border-subtle`, `border-interactive` |
| Interactive | `bg-interactive`, `bg-interactive-hover`, `ring-focus` |
| Brand | `bg-brand`, `bg-brand-hover`, `ring-brand` |
| Error | `bg-error`, `bg-error-hover`, `border-error`, `border-error-subtle`, `text-error`, `ring-error` |
| Warning | `bg-warning`, `border-warning`, `border-warning-subtle`, `text-warning` |
| Success | `bg-success`, `border-success`, `border-success-subtle`, `text-success` |
| Info | `bg-info`, `border-info-subtle`, `text-info` |
| Link | `text-link`, `border-link`, `ring-link` |

## Primitives (escape hatches)

Radix scales, exposed as Tailwind colors: `gray-1..12` + `gray-a1..a12` (solid +
alpha), and alpha-backed `red-*`, `green-*`, `blue-*`, `yellow-*` (amber), plus
`black-a1..a12`. Colored bare steps resolve to the alpha var (`bg-red-3` ===
`var(--red-a3)`).

**Gotchas:**
- Semantic `@utility` tokens do **not** take opacity modifiers. `bg-brand/90`
  won't work - use the explicit state token (`bg-brand-hover`) or a primitive
  with opacity (`text-gray-11/70`).
- Don't use Tailwind's default palettes (`slate`, `zinc`, `neutral`, `emerald`,
  `sky`, `indigo`, `rose`, `amber`, …) - map by intent to a semantic token or a
  primitive instead.
