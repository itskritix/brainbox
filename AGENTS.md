# AGENTS.md

Operational guide for coding agents working in the brainbox monorepo. These are
instructions, not documentation — assume you already know what a monorepo, an
`src/` folder, and TypeScript are. This file loads every session, so every line
has to earn its place.

Claude reads `CLAUDE.md`, Codex reads `AGENTS.md`; `CLAUDE.md` is a symlink to
this file. One source of truth for both.

## What this repo is

Brainbox is an embeddable in-app feedback widget plus the SaaS around it. The
domain vocabulary (Customer vs End-user, Host app, Capture flow, Project key, the
Account → Project → Issue hierarchy) lives in `CONTEXT.md`. Read it before
touching product logic — it is canon, describing how the system is meant to work.

Five surfaces, one workspace package each:

- `widget/` — the embeddable capture UI (`@brainbox/widget`). React, shipped as an
  IIFE script-tag bundle, isolated from the host page via Shadow DOM.
- `dashboard/` — the customer-facing SaaS (`@brainbox/dashboard`). React + Vite +
  React Router.
- `backend/` — the API (`@brainbox/backend`). Hono + Drizzle + Postgres.
- `marketing/` — the landing page (`brainbox-landing`). React + Vite.
- `packages/shared/` — cross-surface types (`@brainbox/shared`). Pure types, no
  runtime.

Package-specific rules live in nested `AGENTS.md` files. Read the one for the
surface you're editing.

## The one rule: verify before you claim done

`pnpm verify` runs lint → typecheck → test → build across every package. It must
pass before a change is finished. Do not report a task complete on a red
`verify`. While iterating, scope to one package — e.g. `pnpm -F @brainbox/backend
test` — but the full `verify` is the gate.

## Types and lint are strict on purpose

This codebase is written mostly by agents, so the compiler and linter are the
first reviewer. Don't defeat them:

- `noUncheckedIndexedAccess` is on: any array/index access is `T | undefined`.
  Handle the undefined case; don't assume the element is there.
- `any` is banned by lint. If a type is hard, model it — reach for `unknown` and
  narrow, never `any`.
- Non-null assertions (`!`) are banned in source. They're allowed only in test
  files, where you control the fixture. In source, guard and return early.
- Prefer early returns over deep nesting. Write code that reads without jumping
  to other files — explicit over clever.

## Tests come with the change

Every package with runtime logic has tests that run under `pnpm verify`. When you
add or change behavior, add or update the test in the same change — a feature
without a test is not done. `packages/shared` is pure types; its contract is
`typecheck`, so it has no runtime tests by design.

## Canon vs. not

- **Canon** (trust as current truth): this file, nested `AGENTS.md`, `CONTEXT.md`,
  and code comments/docstrings.
- **Not canon** (intent or history, may be stale): `docs/adr/*` records *why* past
  decisions were made, not necessarily the current state; commit messages and any
  plan describe intent. Never treat a plan as a description of what exists — read
  the code for that.
