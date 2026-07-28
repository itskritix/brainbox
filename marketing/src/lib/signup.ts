// Types come from the local plan catalogue rather than @brainbox/shared, which
// this package deliberately does not depend on - marketing is a static site
// with no contract with the API beyond these two link params.
import type { BillingPeriod, Plan } from "./pricing"

// Where "get started" sends people. The dashboard handles sign-in, then its own
// paywall routes them to the plan picker, so the marketing site never needs to
// know anything about auth or payment state.
//
// Overridable for local work against a dev dashboard; defaults to production so
// a plain `vite build` is always correct.
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL ?? "https://app.brainbox.sh"

/**
 * Deep link to checkout for one plan. The plan and period ride along as query
 * params so the picker opens pre-selected - a visitor who clicked "Business,
 * annual" should not have to choose it a second time after signing in.
 */
export function checkoutUrl(plan: Plan["id"], period: BillingPeriod): string {
  return `${DASHBOARD_URL}/billing?plan=${plan}&period=${period}`
}

/** Plain entry point, for CTAs that aren't tied to a specific plan. */
export function getStartedUrl(): string {
  return `${DASHBOARD_URL}/billing`
}
