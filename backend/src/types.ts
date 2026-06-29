import type { DB } from "./db/client.ts";

// `authUser` is added to Hono's context by @hono/auth-js's own module
// augmentation, so it isn't declared here.
export interface AppEnv {
  Variables: {
    db: DB;
  };
}
