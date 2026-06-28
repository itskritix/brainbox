import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHead } from "./section-head"

const perks = [
  "Lifetime founding-member pricing",
  "Direct access to the founder",
  "Priority on your feature requests",
  "Unlimited tickets & integrations",
]

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHead
        label="Pricing"
        title="Get in early. Lock it in forever."
        desc="One simple plan for founders who move fast. No tiers, no surprises."
      />

      <div className="mx-auto max-w-md">
        <div className="border-sheen relative overflow-hidden rounded-3xl p-8">
          <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_70%)]" />

          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.04] px-3 py-1 font-mono text-xs text-foreground">
            ★ Founding member
          </span>

          <div className="mt-6 flex items-end gap-1.5">
            <span className="text-5xl font-semibold tracking-[-0.03em] text-foreground">$20</span>
            <span className="mb-1.5 text-muted-foreground">/ month</span>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">per project</p>

          <Button asChild size="lg" className="mt-6 w-full">
            <a href="#">Reserve early access</a>
          </Button>

          <div className="my-7 h-px bg-border" />

          <ul className="space-y-3.5">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-black">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
