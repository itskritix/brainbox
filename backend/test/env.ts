import { readFileSync } from "node:fs";
import { join } from "node:path";

// Single source of truth for the test environment, imported by both
// vitest.config.ts (injected via test.env before any app import) and
// global-setup.ts. Reads backend/.env.test if present, else local defaults
// (the native Postgres on this box; brainbox role has CREATEDB).
function fromEnvTest(): Record<string, string> {
  try {
    const raw = readFileSync(join(import.meta.dirname, "../.env.test"), "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return out;
  } catch {
    return {};
  }
}

const file = fromEnvTest();

export const testEnv: Record<string, string> = {
  DATABASE_URL:
    file.DATABASE_URL ?? "postgres://brainbox:brainbox@localhost:5432/brainbox_test",
  AUTH_SECRET: file.AUTH_SECRET ?? "test-secret-not-for-production-000000000000000=",
  STORAGE_DRIVER: "local",
  PUBLIC_API_URL: file.PUBLIC_API_URL ?? "http://localhost:8787",
  GOOGLE_ID: "test",
  GOOGLE_SECRET: "test",
};
