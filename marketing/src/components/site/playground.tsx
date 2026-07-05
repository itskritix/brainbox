import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatCountdown } from "@/lib/playground"
import { loadWidget, onWidgetSubmitted, resolveWidgetConfig } from "@/lib/widget-loader"
import { SectionHead } from "./section-head"

const anomalies = [
  { id: "AN-01", hint: "One word didn't survive re-entry." },
  { id: "AN-02", hint: "The O₂ tank is fuller than full." },
  { id: "AN-03", hint: "The countdown can't decide which way is down." },
  { id: "AN-04", hint: "A rover has escaped its card." },
]

const REVEAL_MS = 4000

export function Playground() {
  const [submitted, setSubmitted] = useState(false)
  const [reports, setReports] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [elapsed, setElapsed] = useState(47)
  const revealTimer = useRef<number | null>(null)

  useEffect(() => {
    loadWidget(resolveWidgetConfig(import.meta.env))
    return onWidgetSubmitted(() => {
      setSubmitted(true)
      setReports((n) => n + 1)
    })
  }, [])

  useEffect(() => {
    const tick = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(tick)
  }, [])

  useEffect(
    () => () => {
      if (revealTimer.current !== null) window.clearTimeout(revealTimer.current)
    },
    []
  )

  const reveal = () => {
    setRevealed(true)
    if (revealTimer.current !== null) window.clearTimeout(revealTimer.current)
    revealTimer.current = window.setTimeout(() => setRevealed(false), REVEAL_MS)
  }

  // outlines the planted bugs while "Reveal anomalies" is active
  const bug = (extra?: string) =>
    cn(
      "transition-shadow duration-300",
      revealed && "rounded-md ring-1 ring-white/70 motion-safe:animate-pulse",
      extra
    )

  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHead
        label="Live demo — real widget"
        title="Houston, we have four problems."
        desc="Meet Moonbase, a little app we broke on purpose. Find a bug, open the widget, highlight it, and talk — the ticket writes itself."
      />

      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        {/* mission log rail */}
        <div className="flex flex-col justify-center">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-gray-11/70">
            Mission log
          </span>
          <p className="mt-3 text-lg font-semibold tracking-tight text-emphasis">
            Four anomalies shipped to production.
          </p>

          <ul className="mt-5 space-y-2.5">
            {anomalies.map((a) => (
              <li key={a.id} className="flex items-baseline gap-3 text-sm text-default">
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-11/60">
                  {a.id}
                </span>
                {a.hint}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-default">
            Spot one, hit the button below (or the launcher floating in the corner — that&rsquo;s
            the real widget), highlight the damage, and describe it out loud.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => window.Brainbox?.open()}>Report a bug</Button>
            <Button variant="outline" onClick={reveal}>
              Reveal anomalies
            </Button>
          </div>

          {reports > 0 && (
            <p className="mt-5 font-mono text-xs text-gray-11/80">
              Anomalies filed from this page: {reports}
            </p>
          )}
        </div>

        {/* the sabotaged app */}
        <div className="relative">
          <p className="sr-only">
            A deliberately broken demo app called Moonbase, with four planted bugs to report
            through the Brainbox widget: a typo, an oxygen meter over 100%, a countdown counting
            up, and a misplaced button.
          </p>

          <div aria-hidden className="border-sheen rounded-3xl p-1.5 shadow-4xl">
            <div className="overflow-hidden rounded-[1.35rem] border border-default bg-[#0a0a0b]">
              {/* window bar */}
              <div className="flex min-w-0 items-center gap-2 border-b border-default bg-white/[0.02] px-4 py-3">
                <span className="size-2.5 shrink-0 rounded-full border border-default" />
                <span className="size-2.5 shrink-0 rounded-full border border-default" />
                <span className="size-2.5 shrink-0 rounded-full border border-default" />
                <span className="ml-3 truncate font-mono text-[11px] text-default">
                  moonbase.app — {submitted ? "anomaly filed ✓" : "all systems nominal"}
                </span>
              </div>

              {/* app body */}
              <div className="bg-grid relative p-5 text-left sm:p-6">
                <div className="flex items-center justify-between">
                  {/* AN-01: one word didn't survive re-entry */}
                  <h3 className={bug("text-base font-semibold tracking-tight text-emphasis")}>
                    Mision Control
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-11/60">
                    Sol 214 · Sector 7
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {/* AN-02: the O₂ tank is fuller than full */}
                  <div className="rounded-xl border border-default bg-black/40 p-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-11/70">
                      O&#8322; reserve
                    </span>
                    <div className={bug("mt-3 pb-1")}>
                      <div className="relative mr-4 h-1.5 rounded-full bg-white/10">
                        {/* the 100% mark - the fill sails right past it */}
                        <span className="absolute -top-1 right-0 h-3.5 w-px bg-white/40" />
                        <div className="absolute inset-y-0 left-0 w-[108%] rounded-full bg-white/80" />
                      </div>
                      <span className="mt-2 block font-mono text-lg text-emphasis">104%</span>
                    </div>
                  </div>

                  {/* AN-03: the countdown counts up */}
                  <div className="rounded-xl border border-default bg-black/40 p-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-11/70">
                      Launch window
                    </span>
                    <span className={bug("mt-3 block w-fit font-mono text-lg text-emphasis")}>
                      {formatCountdown(elapsed)}
                    </span>
                    <span className="mt-1 block text-xs text-default">counting… somewhere</span>
                  </div>

                  <div className="rounded-xl border border-default bg-black/40 p-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-11/70">
                      Hull temp
                    </span>
                    <span className="mt-3 block font-mono text-lg text-emphasis">−12°C</span>
                    <span className="mt-1 block text-xs text-default">nominal</span>
                  </div>

                  {/* AN-04's crime scene: the rover button escaped this card */}
                  <div className="relative rounded-xl border border-default bg-black/40 p-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-11/70">
                      Surface ops
                    </span>
                    <span className="mt-3 block rounded-lg border border-default px-3 py-1.5 text-center text-xs text-default">
                      Run diagnostics
                    </span>
                    <span
                      className={bug(
                        "absolute -bottom-3 -right-2 block rotate-3 rounded-lg border border-default bg-[#0a0a0b] px-3 py-1.5 text-xs text-default shadow-3xl"
                      )}
                    >
                      Deploy rover
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* the payoff: a submission just became a ticket */}
          {submitted && (
            <div className="border-sheen absolute inset-x-4 -bottom-5 z-10 flex items-center gap-3 rounded-xl p-3.5 shadow-4xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 sm:inset-x-10">
              <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black">
                BUG
              </span>
              <p className="min-w-0 text-xs leading-relaxed text-default">
                <span className="font-semibold text-emphasis">Ticket filed.</span> Title, repro,
                labels and screenshot — already written, sitting in the demo inbox.
              </p>
              <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-md border border-default px-2 py-1 font-mono text-[10px] text-default sm:inline-flex">
                <Sparkles className="size-3" /> auto-written
              </span>
            </div>
          )}

          <p className="mt-9 text-center font-mono text-xs text-gray-11/70">
            zero mocks — this page runs the same script tag your users get
          </p>
        </div>
      </div>
    </section>
  )
}
