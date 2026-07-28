import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BillingPeriod, BillingState } from "@brainbox/shared";

import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";
import {
  OVERAGE_CENTS_PER_TICKET,
  PLAN_OPTIONS,
  annualSavingsPercent,
  displayPriceCents,
  formatUsd,
  type PlanOption,
} from "../lib/plans";
import { cn } from "../lib/utils";

const PERIODS: { value: BillingPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
];

export function Billing() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<BillingPeriod>("annual");
  const [state, setState] = useState<BillingState | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getBillingState()
      .then(setState)
      .catch(() => setState({ subscription: null, exempt: false, hasAccess: false }));
  }, []);

  async function choose(plan: PlanOption) {
    setStarting(plan.id);
    setError(null);
    try {
      const { checkoutUrl } = await api.startCheckout(plan.id, period);
      // Full navigation, not a router push: checkout is Dodo's own page.
      window.location.assign(checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout");
      setStarting(null);
    }
  }

  if (!state) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Spinner />
      </div>
    );
  }

  // Already paying (or exempt) and they navigated here anyway - offer the way
  // back rather than inviting a second subscription.
  if (state.hasAccess) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold tracking-tight text-emphasis">
            {state.exempt ? "Your account is comped" : `You're on ${state.subscription?.plan}`}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {state.exempt
              ? "No subscription needed on this account."
              : "Your subscription is active."}
          </p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Back to your projects
          </Button>
        </div>
      </div>
    );
  }

  const lapsed = state.subscription && !state.subscription.hasAccess;

  return (
    <div className="min-h-dvh bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-emphasis">
            {lapsed ? "Your subscription lapsed" : "Choose a plan"}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
            {lapsed
              ? `Your subscription is ${state.subscription?.status}. Pick a plan to pick up where you left off - your projects and history are untouched.`
              : "Unlimited projects, seats and pageviews on both plans. You only pay for the tickets you actually get."}
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="inline-flex rounded-full border border-default bg-interactive p-1"
          >
            {PERIODS.map((p) => (
              <button
                key={p.value}
                role="radio"
                aria-checked={period === p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                  period === p.value
                    ? "bg-brand text-on-brand"
                    : "text-muted hover:text-emphasis",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {PLAN_OPTIONS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border border-default bg-elevated p-6",
                plan.featured && "border-interactive",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-emphasis">{plan.name}</h2>
                {plan.featured && (
                  <span className="rounded-full border border-default px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-muted">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

              <div className="mt-5 flex items-end gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-emphasis">
                  {formatUsd(displayPriceCents(plan, period))}
                </span>
                <span className="mb-1 text-sm text-muted">/ month</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {period === "annual"
                  ? `${formatUsd(plan.annualCents)} billed yearly · save ${annualSavingsPercent(plan)}%`
                  : "billed monthly"}
              </p>

              <Button
                className="mt-5 w-full"
                variant={plan.featured ? "default" : "secondary"}
                disabled={starting !== null}
                onClick={() => void choose(plan)}
              >
                {starting === plan.id ? <Spinner /> : `Choose ${plan.name}`}
              </Button>

              <p className="mt-5 text-xs uppercase tracking-wide text-muted">
                {plan.ticketsPerMonth.toLocaleString("en-US")} tickets / month
              </p>
              <ul className="mt-3 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-default">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-6 text-center text-sm text-error">
            {error}
          </p>
        )}

        <p className="mt-8 text-center text-xs text-muted">
          60-day money-back guarantee. Over your allowance it&rsquo;s{" "}
          {formatUsd(OVERAGE_CENTS_PER_TICKET)} per extra ticket &mdash; we never drop
          your users&rsquo; feedback to enforce a limit.
        </p>
      </div>
    </div>
  );
}
