import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "@auth/core/providers/google";

import { db } from "../db/client.ts";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "../db/schema/index.ts";
import { env } from "../env.ts";

// Passed to initAuthConfig(); it invokes this per request (the Context arg is
// unused — all config comes from `env`, since `c.env` is empty on Node).
export function getAuthConfig() {
  return {
    secret: env.AUTH_SECRET,
    trustHost: true,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [
      Google({ clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET }),
    ],
    session: { strategy: "jwt" as const },
  };
}
