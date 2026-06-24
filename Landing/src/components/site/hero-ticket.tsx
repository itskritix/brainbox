import { Sparkles } from "lucide-react"

const chips = ["● HIGH", "type: bug", "Chrome · macOS", "/settings/billing"]

/**
 * The hero "auto-written ticket" product visual.
 * Currently NOT rendered (hidden per request). To restore, import this in
 * hero.tsx and drop <HeroTicket /> back in below the trust line.
 */
export function HeroTicket() {
  return (
    <div className="relative mx-auto mt-12 max-w-3xl md:mt-14">
      <div className="pointer-events-none absolute -inset-x-10 -top-12 bottom-0 z-0 bg-[radial-gradient(ellipse_50%_55%_at_50%_0%,rgba(255,255,255,0.09),transparent_70%)]" />
      <div className="border-sheen relative z-10 rounded-3xl p-1.5 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="overflow-hidden rounded-[1.35rem] border border-border bg-[#0a0a0b]">
          {/* window bar */}
          <div className="flex min-w-0 items-center gap-2 border-b border-border bg-white/[0.02] px-4 py-3">
            <span className="size-2.5 shrink-0 rounded-full border border-border" />
            <span className="size-2.5 shrink-0 rounded-full border border-border" />
            <span className="size-2.5 shrink-0 rounded-full border border-border" />
            <span className="ml-3 truncate font-mono text-[11px] text-muted-foreground">
              brainbox → linear
            </span>
            <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground sm:inline-flex">
              <Sparkles className="size-3" /> auto-written
            </span>
          </div>

          {/* body */}
          <div className="grid gap-6 p-6 text-left md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="border-l border-white/15 pl-3 text-sm italic leading-relaxed text-muted-foreground">
                &ldquo;The save button on billing settings just doesn&rsquo;t do anything when I
                click it. No error, nothing. I tried twice.&rdquo;
              </p>
              <div className="my-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                <span className="h-px flex-1 bg-border" /> written by brainbox
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black">
                  BUG
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Billing
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                Save button unresponsive on Billing settings
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The &ldquo;Save changes&rdquo; button on Billing settings does nothing when clicked.
                No success toast, no error, no state change.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-grid relative aspect-[16/10] overflow-hidden rounded-xl border border-border">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_55%,rgba(255,255,255,0.06),transparent_60%)]" />
                <div className="absolute left-[16%] top-[28%] h-[36%] w-[44%] rounded-md border border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-black/70 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-white" /> screenshot
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
