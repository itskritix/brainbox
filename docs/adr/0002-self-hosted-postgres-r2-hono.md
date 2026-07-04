# 2. Self-hosted Postgres + R2 + Hono over a BaaS

Date: 2026-06-28

## Status

Accepted

## Context

The v0 backend needs a database (accounts/projects/issues), blob storage
(screenshots + audio), Google OAuth, and a public ingest endpoint the widget can
POST to.

A managed BaaS (e.g. Supabase) was considered first because it bundles Postgres
+ Google OAuth + Storage + row-level security behind one service, minimizing
hand-rolled glue. It was rejected in favor of an owned, portable stack.

The deciding factor: the operator runs a powerful EC2 box today and wants to
move to a VPS later, and wants to avoid vendor lock-in. A long-running,
self-contained process maps cleanly onto "copy the container, re-run it
elsewhere"; a BaaS does not.

## Decision

- **API**: Node + **Hono**, a long-running self-hosted process (EC2 now → VPS
  later), containerized with Docker.
- **Database**: **Postgres in Docker**, in the same `docker-compose` as the API.
  Access via **Drizzle** (schema, queries, migrations).
- **Blob storage**: **Cloudflare R2** (private bucket; S3-compatible, so it
  moves with us and pairs with the existing Cloudflare footprint).
- **Auth**: **Auth.js** (`@hono/auth-js` + `@auth/drizzle-adapter`),
  **Google OAuth only**, with all auth data in our own Postgres. The Auth.js
  `users` table is the Account.

## Consequences

- Full portability and no vendor lock-in: the whole backend is a compose file
  that runs on any box.
- We own work the BaaS would have given for free: the Google OAuth flow +
  sessions (delegated to Auth.js, so bounded), and R2 upload + presigned-URL
  handling.
- R2 is the one external dependency, chosen because it is S3-compatible and
  swappable, not a lock-in.
- Ingest proxies file bytes through the API to R2 (not presigned direct upload)
  for v0 - files are small and volume is low; revisit presigned uploads if
  upload volume grows.
