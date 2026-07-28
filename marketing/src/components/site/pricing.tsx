import { useState } from "react"
import { Check, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  OVERAGE_CENTS_PER_TICKET,
  PLANS,
  annualMonthsFree,
  annualSavingsPercent,
  displayPriceCents,
  formatUsd,
  type BillingPeriod,
} from "@/lib/pricing"
import { checkoutUrl } from "@/lib/signup"
import { SectionHead } from "./section-head"

const PERIODS: { value: BillingPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
]

export function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>("annual")

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHead
        label="Pricing"
        title="We charge for feedback. Not for traffic."
        desc="Unlimited projects, unlimited seats, unlimited pageviews on every plan. You only ever pay for the tickets you actually get."
      />

      <div className="mb-12 flex flex-col items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="inline-flex rounded-full border border-default bg-white/[0.03] p-1"
        >
          {PERIODS.map((p, i) => (
            <button
              key={p.value}
              role="radio"
              aria-checked={period === p.value}
              // Roving tabindex: a radio group is ONE tab stop, and arrow keys
              // move within it. Leaving every option tabbable makes a keyboard
              // user tab through each one, which is not the expected pattern.
              tabIndex={period === p.value ? 0 : -1}
              onKeyDown={(e) => {
                if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
                e.preventDefault();
                const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
                const next = PERIODS[(i + delta + PERIODS.length) % PERIODS.length];
                if (!next) return;
                setPeriod(next.value);
                // Selection follows focus, so move focus with it.
                const group = e.currentTarget.parentElement;
                const buttons = group?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
                buttons?.[(i + delta + PERIODS.length) % PERIODS.length]?.focus();
              }}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                period === p.value
                  ? "bg-white text-black"
                  : "text-default hover:text-emphasis"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "border-sheen relative flex flex-col overflow-hidden rounded-3xl p-8",
              plan.featured && "bg-white/[0.02]"
            )}
          >
            {plan.featured && (
              <>
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_70%)]" />
              </>
            )}

            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight text-emphasis">
                {plan.name}
              </h3>
              {plan.featured && (
                <span className="inline-flex items-center rounded-full border border-default bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-emphasis">
                  Most popular
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-default">{plan.tagline}</p>

            <div className="mt-6 flex items-end gap-1.5">
              <span className="text-5xl font-semibold tracking-[-0.03em] text-emphasis">
                {formatUsd(displayPriceCents(plan, period))}
              </span>
              <span className="mb-1.5 text-default">/ month</span>
            </div>
            <p className="mt-1 font-mono text-xs text-default">
              {period === "annual"
                ? `${formatUsd(plan.annualCents)} billed yearly`
                : "billed monthly"}
            </p>
            {/* Shown on both periods. Each card states its OWN saving - the two
                plans discount at different rates (41% vs 47%), so one figure
                above the grid would misstate whichever plan it wasn't taken
                from. On monthly it reads as the nudge to switch. */}
            <p className="mt-3 inline-flex w-fit items-center rounded-full border border-default bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-emphasis">
              {period === "annual" ? (
                <>
                  Save {annualSavingsPercent(plan)}% &middot; {annualMonthsFree(plan)} months
                  free
                </>
              ) : (
                <>Save {annualSavingsPercent(plan)}% with annual</>
              )}
            </p>

            <Button
              asChild
              size="lg"
              variant={plan.featured ? "default" : "secondary"}
              className="mt-6 w-full"
            >
              {/* Straight to checkout for THIS plan and period - someone who
                  picked "Business, annual" should not have to choose again on
                  the other side of sign-in. */}
              <a href={checkoutUrl(plan.id, period)}>Get {plan.name}</a>
            </Button>

            <div className="my-7 h-px bg-gray-a3" />

            <p className="mb-4 font-mono text-xs uppercase tracking-[0.1em] text-default">
              {plan.ticketsPerMonth.toLocaleString("en-US")} tickets / month
            </p>
            <ul className="space-y-3.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-emphasis">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-black">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-4xl space-y-3 text-center">
        <p className="inline-flex items-center gap-2 text-sm text-emphasis">
          <ShieldCheck className="size-4" />
          60-day money-back guarantee. Cancel any time.
        </p>
        <p className="text-sm text-default">
          Go over your allowance and it&rsquo;s{" "}
          {formatUsd(OVERAGE_CENTS_PER_TICKET)} per extra ticket - we never drop your
          users&rsquo; feedback to enforce a limit.
        </p>
      </div>
    </section>
  )
}
