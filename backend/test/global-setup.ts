import { join } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { testEnv } from "./env.ts";

// Runs once before the suite: ensure the test DB exists, then apply migrations.
export default async function setup() {
  const dbName = new URL(testEnv.DATABASE_URL).pathname.slice(1);

  const adminUrl = new URL(testEnv.DATABASE_URL);
  adminUrl.pathname = "/postgres";
  const admin = postgres(adminUrl.toString(), { max: 1 });
  const exists = await admin`select 1 from pg_database where datname = ${dbName}`;
  if (exists.length === 0) await admin.unsafe(`create database "${dbName}"`);
  await admin.end();

  const client = postgres(testEnv.DATABASE_URL, { max: 1 });
  await migrate(drizzle(client), {
    migrationsFolder: join(import.meta.dirname, "../drizzle"),
  });
  await client.end();
}
