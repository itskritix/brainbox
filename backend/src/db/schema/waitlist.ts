import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Early-access signups from the marketing site. We own this list in Postgres
// (source of truth); the confirmation email is sent via the email driver layer.
export const waitlistSignups = pgTable("waitlist_signups", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // Stored normalized (trimmed + lowercased); unique so re-submits are idempotent.
  email: text("email").notNull().unique(),
  // Where the signup came from (only "marketing" today; room for referral/API).
  source: text("source").notNull().default("marketing"),
  // Delivery state of the confirmation email.
  emailStatus: text("email_status")
    .$type<"pending" | "sent" | "failed">()
    .notNull()
    .default("pending"),
  // Last send error, when emailStatus = "failed" (for debugging / manual retry).
  emailError: text("email_error"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
