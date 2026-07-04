# widget - AGENTS.md

The embeddable capture UI (`@brainbox/widget`). React, built as an IIFE
script-tag bundle that runs inside the customer's page. Root rules in `/AGENTS.md`
apply.

## What makes the widget different

It runs inside a **host app you don't control**, so isolation is the whole game:

- The UI mounts in a **Shadow DOM** so host CSS can't bleed in and widget CSS
  can't leak out. Don't reach into `document` for styling or assume global
  styles; keep everything scoped to the shadow root.
- `src/embed.ts` is the IIFE entry (the script-tag bundle). `src/App.tsx` is the
  React surface. The capture flow (open → highlight → screenshot → compose →
  submit) is defined in `CONTEXT.md`.
- Keep DOM/browser logic in `src/lib/*` as small pure functions with a colocated
  `*.test.ts`. That's why `selector`, `position`, `metadata`, `config`, `submit`
  are unit-testable without a browser - follow that pattern for new logic.

## Tests

Vitest under jsdom. Test the `lib/*` functions directly rather than driving the
React tree. `!` is allowed in `*.test.ts`. Run: `pnpm -F @brainbox/widget test`.
