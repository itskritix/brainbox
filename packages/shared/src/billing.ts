/** The two paid tiers. Account-level: a plan covers every project the Account
 *  owns, which is why the pricing page can promise unlimited projects. */
export type PlanId = "pro" | "business";

/** How often the plan renews. Annual is one payment for twelve months. */
export type BillingPeriod = "monthly" | "annual";

/**
 * Subscription lifecycle, mirroring the states Dodo reports on its webhooks.
 * Only `active` grants access - see `hasAccess` on the Subscription contract.
 *
 * - `active`     paid and current
 * - `on_hold`    payment failed, Dodo is retrying; access is suspended
 * - `cancelled`  ended, by the customer or after retries were exhausted
 * - `expired`    ran past its term without renewing
 * - `pending`    checkout completed, waiting on the first payment to confirm
 */
export type SubscriptionStatus =
  | "pending"
  | "active"
  | "on_hold"
  | "cancelled"
  | "expired";

/** An Account's subscription as the dashboard sees it. */
export interface Subscription {
  plan: PlanId;
  period: BillingPeriod;
  status: SubscriptionStatus;
  /** Tickets included per billing cycle before overage applies. */
  ticketsPerPeriod: number;
  /** End of the paid period, ISO 8601. Null until Dodo reports one. */
  currentPeriodEnd: string | null;
  /** True when the Account may use the product. Computed server-side so the
   *  dashboard never has to re-derive the rule from `status`. */
  hasAccess: boolean;
}

/**
 * What `GET /api/billing/subscription` returns.
 *
 * `subscription` is null for an Account that has never paid. `exempt` marks an
 * Account allowed through without one (our own accounts, via
 * BILLING_EXEMPT_EMAILS) - the dashboard shows no upgrade nag for those.
 */
export interface BillingState {
  subscription: Subscription | null;
  exempt: boolean;
  hasAccess: boolean;
}
