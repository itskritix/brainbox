import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="top" className="bg-noise glow-top relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_25%,transparent_75%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-24 text-center md:pt-24 md:pb-32">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-default bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-default">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-white" />
          </span>
          In-app feedback, auto-filed as tickets
        </span>

        <h1 className="text-gradient mx-auto max-w-4xl text-balance text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-6xl md:text-[5.2rem] md:leading-[0.98]">
          Stop triaging feedback.
          <br />
          Start shipping fixes.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-default">
          Brainbox is a tiny widget for your app. A user taps, points at what broke, and talks.
          A ready-to-work ticket lands in Linear, GitHub, or Slack. The hours you spend decoding
          &ldquo;it&rsquo;s broken&rdquo; messages go back into building.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          {/* The try-it arrow measures this button to find where to start. */}
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <a href="#pricing" data-hero-cta>
              Get started
            </a>
          </Button>
          <span className="font-mono text-xs text-gray-11/80">
            From $29/mo &middot; 60-day money-back guarantee
          </span>
        </div>

      </div>
    </section>
  )
}
