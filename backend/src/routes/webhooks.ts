import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { Webhook } from "standardwebhooks";
import type { SubscriptionStatus } from "@brainbox/shared";

import { db } from "../db/client.ts";
import { subscriptions, webhookEvents } from "../db/schema/index.ts";
import { env } from "../env.ts";
import { planForProductId } from "../lib/dodo.ts";

// Dodo's subscription states -> ours. Anything unmapped is ignored rather than
// guessed at: writing a wrong status here either locks a paying customer out or
// lets a lapsed one stay in.
const STATUS: Record<string, SubscriptionStatus> = {
  active: "active",
  on_hold: "on_hold",
  cancelled: "cancelled",
  canceled: "cancelled",
  expired: "expired",
  pending: "pending",
  failed: "on_hold",
};

interface SubscriptionPayload {
  subscription_id?: string;
  customer?: { customer_id?: string };
  product_id?: string;
  status?: string;
  next_billing_date?: string;
  metadata?: Record<string, string>;
}

export const webhooks = new Hono();

// Public: authenticated by signature, not by session. Mounted before the auth
// gate in app.ts.
webhooks.post("/dodo", async (c) => {
  if (!env.DODO_WEBHOOK_SECRET) {
    // Refusing unverifiable payment events is the only safe default. 500 (not
    // 4xx) so Dodo retries once the secret is configured instead of discarding.
    console.error("[webhooks] DODO_WEBHOOK_SECRET is not set - rejecting");
    return c.json({ error: "Webhooks not configured" }, 500);
  }

  // Signature covers the exact bytes sent, so verify the raw text before any
  // parsing. Re-serialising a parsed object would change the bytes and fail.
  const raw = await c.req.text();
  const headers = {
    "webhook-id": c.req.header("webhook-id") ?? "",
    "webhook-signature": c.req.header("webhook-signature") ?? "",
    "webhook-timestamp": c.req.header("webhook-timestamp") ?? "",
  };

  try {
    new Webhook(env.DODO_WEBHOOK_SECRET).verify(raw, headers);
  } catch (err) {
    console.error("[webhooks] signature verification failed:", err);
    return c.json({ error: "Invalid signature" }, 400);
  }

  const event = JSON.parse(raw) as { type?: string; data?: SubscriptionPayload };
  const type = event.type ?? "";
  const eventId = headers["webhook-id"];

  // Idempotency: Dodo retries anything that is not 2xx, so the same event can
  // arrive twice. Claiming the id first turns a duplicate into a conflict we
  // skip. onConflictDoNothing + rowcount tells us which case we are in.
  const claimed = await db
    .insert(webhookEvents)
    .values({ id: eventId, type })
    .onConflictDoNothing()
    .returning({ id: webhookEvents.id });
  if (claimed.length === 0) {
    return c.json({ received: true, duplicate: true });
  }

  try {
    await applySubscriptionEvent(type, event.data ?? {});
  } catch (err) {
    // Surface as 500 so Dodo retries. The event id is already claimed, so
    // release it or the retry would be skipped as a duplicate.
    await db.delete(webhookEvents).where(eq(webhookEvents.id, eventId));
    console.error(`[webhooks] failed to apply ${type}:`, err);
    return c.json({ error: "Processing failed" }, 500);
  }

  return c.json({ received: true });
});

async function applySubscriptionEvent(type: string, data: SubscriptionPayload) {
  if (!type.startsWith("subscription.")) return;

  const dodoSubscriptionId = data.subscription_id;
  if (!dodoSubscriptionId) throw new Error("subscription event without subscription_id");

  const status = STATUS[data.status ?? ""];
  if (!status) {
    console.warn(`[webhooks] ignoring ${type} with unmapped status ${data.status}`);
    return;
  }

  const currentPeriodEnd = data.next_billing_date ? new Date(data.next_billing_date) : null;

  // An update to a subscription we already know about: status changes only.
  // Matching on the Dodo id means renewals and cancellations land on the right
  // row even though they carry no session or user context.
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.dodoSubscriptionId, dodoSubscriptionId))
    .limit(1);

  if (existing) {
    await db
      .update(subscriptions)
      .set({ status, currentPeriodEnd, updatedAt: new Date() })
      .where(eq(subscriptions.dodoSubscriptionId, dodoSubscriptionId));
    return;
  }

  // First time we have seen it - the checkout we started. `metadata.userId` is
  // the only link back to the Account, since the webhook arrives out-of-band
  // with no session.
  const userId = data.metadata?.userId;
  if (!userId) throw new Error(`${type} for unknown subscription and no metadata.userId`);

  const productId = data.product_id ?? "";
  const mapped = planForProductId(productId);
  if (!mapped) throw new Error(`${type} references unconfigured product ${productId}`);

  await db
    .insert(subscriptions)
    .values({
      userId,
      dodoSubscriptionId,
      dodoCustomerId: data.customer?.customer_id ?? "",
      dodoProductId: productId,
      plan: mapped.plan,
      period: mapped.period,
      status,
      currentPeriodEnd,
    })
    // An Account re-subscribing after cancelling already has a row; the unique
    // index on user_id would otherwise reject it.
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        dodoSubscriptionId,
        dodoCustomerId: data.customer?.customer_id ?? "",
        dodoProductId: productId,
        plan: mapped.plan,
        period: mapped.period,
        status,
        currentPeriodEnd,
        updatedAt: new Date(),
      },
    });
}
