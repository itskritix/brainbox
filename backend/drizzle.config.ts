import { join } from "node:path";

import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't auto-load .env; pull it in from this file's directory
// (cwd-independent). No-op if absent — env may come from the shell / CI.
try {
  process.loadEnvFile(join(import.meta.dirname, ".env"));
} catch {
  // env provided externally
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
