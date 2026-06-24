import { Camera, Crop, MousePointerClick, Send } from "lucide-react"
import { SectionHead } from "./section-head"

const steps = [
  {
    n: "01",
    icon: MousePointerClick,
    title: "Click the widget",
    body: "The user taps the floating Brainbox button in the corner of your app.",
  },
  {
    n: "02",
    icon: Crop,
    title: "Highlight & talk",
    body: "They circle the broken area on screen and describe the issue with their voice.",
  },
  {
    n: "03",
    icon: Camera,
    title: "Brainbox captures",
    body: "Screenshot, page URL, browser data and full user context, collected automatically.",
  },
  {
    n: "04",
    icon: Send,
    title: "The ticket ships",
    body: "A structured ticket lands in Linear, GitHub, Slack or Gmail, instantly.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHead
        label="How it works"
        title="From a tap to a ticket in four steps."
        desc="No setup for your users. No forms, no friction. Just point, talk, and ship."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="border-sheen rounded-2xl p-6 transition-colors duration-200 hover:border-white/15"
          >
            <div className="font-mono text-xs text-muted-foreground/60">{s.n}</div>
            <div className="mt-5 inline-flex size-11 items-center justify-center rounded-xl border border-border bg-white/[0.03]">
              <s.icon className="size-5 text-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
