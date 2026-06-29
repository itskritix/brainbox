import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../env.ts";
import * as schema from "./schema/index.ts";

// One pool for the lifetime of this long-running process.
const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });
export type DB = typeof db;
