import { WaitlistForm } from "./waitlist-form"
import { HeroTicket } from "./hero-ticket"

export function Hero() {
  return (
    <section id="top" className="bg-noise glow-top relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_25%,transparent_75%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-24 text-center md:pt-24 md:pb-32">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-white" />
          </span>
          In-app feedback, auto-filed as tickets
        </span>

        <h1 className="text-gradient mx-auto max-w-4xl text-balance text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-6xl md:text-[5.2rem] md:leading-[0.98]">
          Users talk.
          <br />
          Brainbox writes the ticket.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Your users tap once. You get a clear, contextual issue: what broke, what they said, and
          the feature they want, straight in Linear, GitHub, or Slack.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          <WaitlistForm />
          <span className="font-mono text-xs text-muted-foreground/80">
            Built for indie hackers &amp; small product teams
          </span>
        </div>

        {/* product visual: raw user complaint → the ticket Brainbox writes */}
        <HeroTicket />

        <p className="mx-auto mt-8 max-w-lg text-pretty text-[15px] leading-relaxed text-muted-foreground/80">
          Other tools just forward the message. Brainbox{" "}
          <span className="text-foreground">writes the ticket</span> &mdash; title, repro,
          labels and screenshot &mdash; so you never triage a raw note again.
        </p>
      </div>
    </section>
  )
}
