import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "@auth/core/providers/google";
import type { EmailConfig } from "@auth/core/providers/email";

import { db } from "../db/client.ts";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "../db/schema/index.ts";
import { getEmailer } from "../email/index.ts";
import { magicLinkEmail } from "../email/templates/magic-link.ts";
import { env } from "../env.ts";

// How long a sign-in link stays usable. Short enough that a forwarded or
// leaked mail stops working quickly, long enough to survive a slow inbox.
const MAGIC_LINK_MAX_AGE_SECONDS = 15 * 60;

// Magic-link sign-in, declared inline rather than via the Nodemailer provider:
// that one hard-imports `nodemailer` and throws without an SMTP `server`, and
// we already have an Emailer abstraction (console in dev/test, Resend in prod)
// plus a Resend-verified domain. Auth.js treats any `type: "email"` provider
// generically, so this needs no extra dependency.
//
// Requires the adapter's verificationTokens table, which the Drizzle schema
// already defines for exactly this purpose.
const magicLink: EmailConfig = {
  id: "magic-link",
  type: "email",
  name: "Email",
  from: env.EMAIL_FROM,
  maxAge: MAGIC_LINK_MAX_AGE_SECONDS,
  options: {},
  async sendVerificationRequest({ identifier, url }) {
    const { subject, html, text } = magicLinkEmail(
      url,
      MAGIC_LINK_MAX_AGE_SECONDS / 60,
    );
    // Throwing here surfaces to the caller as a failed sign-in, which is what
    // we want: silently swallowing it would leave the user waiting for a mail
    // that is never coming.
    await getEmailer().send({
      to: identifier,
      subject,
      html,
      text,
      ...(env.EMAIL_REPLY_TO ? { replyTo: env.EMAIL_REPLY_TO } : {}),
    });
  },
};

// Extra fields captured from the Google profile and persisted on `users`.
declare module "@auth/core/types" {
  interface User {
    firstName?: string | null;
    lastName?: string | null;
  }
}
declare module "@auth/core/adapters" {
  interface AdapterUser {
    firstName?: string | null;
    lastName?: string | null;
  }
}

// Passed to initAuthConfig(); it invokes this per request (the Context arg is
// unused - all config comes from `env`, since `c.env` is empty on Node).
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
      Google({
        clientId: env.GOOGLE_ID,
        clientSecret: env.GOOGLE_SECRET,
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            firstName: profile.given_name ?? null,
            lastName: profile.family_name ?? null,
            email: profile.email,
            image: profile.picture,
          };
        },
      }),
      magicLink,
    ],
    session: { strategy: "jwt" as const },
  };
}
