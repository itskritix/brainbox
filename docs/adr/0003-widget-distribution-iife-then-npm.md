# 3. Widget distribution: IIFE script-tag first, npm SDK at MVP

Date: 2026-06-28

## Status

Accepted

## Context

The widget must be installable by customers (SaaS founders) on any stack. There
are two distribution forms:

- **Script-tag IIFE** — a self-contained bundle dropped in via
  `<script src=".../widget.js" data-project="pk_...">`. Zero build step, no
  framework or peer-dependency assumptions about the host. Lowest install
  friction for the ICP (paste a snippet).
- **npm package** — `import { Brainbox } from '@brainbox/widget'`. Gives bundler
  users tree-shaking, TS types, and a React component, but assumes a build step
  and (for the React wrapper) a matching React.

We do not want to fork code for these. Both must come from the single `widget/`
source.

## Decision

Phase the distribution from one codebase:

1. **v0 — IIFE only.** Vite library mode emits a standalone IIFE bundle. Install
   is the script snippet; the public API is a global `window.Brainbox`.
2. **MVP — add the npm package.** Same `widget/` source; Vite additionally emits
   an ES module. Published as `@brainbox/widget`. Usage:
   ```js
   import { Brainbox } from '@brainbox/widget'
   Brainbox.init({ projectKey: 'pk_...', trigger: 'floating' })
   Brainbox.identify({ id, email })
   Brainbox.open()
   ```
   plus a thin React wrapper over the same core:
   ```jsx
   import { Brainbox } from '@brainbox/widget/react'
   <Brainbox projectKey="pk_..." trigger="floating" />
   ```
   TS types come straight from `packages/shared`.
3. **End state — both** maintained side-by-side.

The capture flow, Shadow DOM isolation, and `/ingest` contract are identical
across all forms; only the entry/packaging differs.

## Consequences

- One source of truth for the widget; distribution is a build-output and entry
  concern, not a code fork.
- `packages/shared` is the typed contract reused by the npm SDK, so SDK types
  cannot drift from what the widget sends or the backend ingests.
- The React wrapper is intentionally thin (mount/config over the vanilla core)
  to avoid a second implementation.
- Deferring npm to MVP keeps v0 focused on proving the end-to-end pipe via the
  script-tag.
