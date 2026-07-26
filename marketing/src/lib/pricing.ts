// Plan definitions for the pricing section.
//
// Amounts are in cents, matching the Dodo Payments products they mirror - the
// payment provider is the source of truth and it stores minor units, so keeping
// cents here means the page and the checkout can never drift by a rounding.
//
//   Pro      - pdt_0Nk1rAzeNtk84uX31ouXh (monthly) / pdt_0Nk1rCteNVBdisyUN4c1f (annual)
//   Business - pdt_0Nk1rCubHQQcxAyf6aKk6 (monthly) / pdt_0Nk1rCx3uCXnW2ufuSmJy (annual)

export type BillingPeriod = "monthly" | "annual";

export interface Plan {
  id: "pro" | "business";
  name: string;
  tagline: string;
  /** Charged every month on the monthly plan. */
  monthlyCents: number;
  /** Charged once per year on the annual plan. */
  annualCents: number;
  ticketsPerMonth: number;
  features: string[];
  /** The tier the page steers people toward. */
  featured: boolean;
}

export const PRO: Plan = {
  id: "pro",
  name: "Pro",
  tagline: "For founders and small product teams.",
  monthlyCents: 4_900,
  annualCents: 34_800,
  ticketsPerMonth: 1_000,
  features: [
    "Unlimited projects, seats & pageviews",
    "Voice notes, screen recording & session replay",
    "Screenshot with the broken area highlighted",
    "Linear, GitHub & Slack - included as they ship",
    "12 months of history",
  ],
  featured: false,
};

export const BUSINESS: Plan = {
  id: "business",
  name: "Business",
  tagline: "For teams shipping to a lot of users.",
  monthlyCents: 14_900,
  annualCents: 94_800,
  ticketsPerMonth: 5_000,
  features: [
    "Everything in Pro",
    "Unlimited history",
    "API access & webhooks",
    "Priority support queue",
    "Onboarding call with the founder",
  ],
  featured: true,
};

export const PLANS: readonly Plan[] = [PRO, BUSINESS];

/** Charged per ticket once a plan's monthly allowance is used up. */
export const OVERAGE_CENTS_PER_TICKET = 3;

/**
 * What the annual plan works out to per month. Annual is billed as one payment,
 * but it's quoted per-month so the two columns compare directly.
 */
export function monthlyEquivalentCents(plan: Plan): number {
  return Math.round(plan.annualCents / 12);
}

/** How much cheaper a year of the annual plan is than a year of the monthly one. */
export function annualSavingsPercent(plan: Plan): number {
  const yearOfMonthly = plan.monthlyCents * 12;
  return Math.round((1 - plan.annualCents / yearOfMonthly) * 100);
}

/**
 * The annual saving expressed as "months free", which lands harder than a
 * percentage. Derived rather than written into the copy so it can't go stale
 * when a price moves.
 */
export function annualMonthsFree(plan: Plan): number {
  const saved = plan.monthlyCents * 12 - plan.annualCents;
  return Math.round(saved / plan.monthlyCents);
}

/**
 * The best saving on offer across all plans. Only for "save up to X%" copy shown
 * before a plan is picked - once a card is on screen it states its own number.
 */
export function bestAnnualSavingsPercent(): number {
  return Math.max(...PLANS.map(annualSavingsPercent));
}

/** The headline per-month figure for the period the visitor is looking at. */
export function displayPriceCents(plan: Plan, period: BillingPeriod): number {
  return period === "monthly" ? plan.monthlyCents : monthlyEquivalentCents(plan);
}

/** `4900` -> `"$49"`, `3` -> `"$0.03"`. Whole dollars lose the trailing `.00`. */
export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
