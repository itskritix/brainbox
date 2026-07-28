import { useEffect, useRef, useState } from "react"
import { arrowGeometry, launcherCenter, type ArrowGeometry } from "@/lib/try-it-arrow"
import { onWidgetReady, onWidgetSubmitted, openWidget } from "@/lib/widget-loader"

/** Anchor the arrow just off the hero CTA's bottom-right corner. */
const START_OFFSET = { x: 34, y: -4 }

/** Scroll distance, as a fraction of the viewport, over which the cue leaves. */
const FADE_OVER = 0.5

/**
 * Draws a big annotation arrow from the hero CTA to the live widget launcher in
 * the corner, so visitors know the floating button IS the product and not a
 * support chat they've been trained to ignore.
 *
 * The page already runs the real widget - this is the only thing that says so.
 */
export function TryItCue() {
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [geom, setGeom] = useState<ArrowGeometry | null>(null)
  const [drawn, setDrawn] = useState(0)
  const [scrolled, setScrolled] = useState(0)
  const curveRef = useRef<SVGPathElement>(null)
  const [curveLength, setCurveLength] = useState(0)
  // Read once, and applied in render rather than pushed into state: someone who
  // asked for less motion gets the finished arrow, never the drawing of it.
  const [reducedMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  )
  const progress = reducedMotion ? 1 : drawn

  // Wait for the launcher: pointing at a button that hasn't loaded is worse
  // than not pointing at all.
  useEffect(() => onWidgetReady(() => setReady(true)), [])

  // Once they've actually sent feedback, the cue has done its job.
  useEffect(() => onWidgetSubmitted(() => setDismissed(true)), [])

  // Re-measured every frame of scroll, not drawn once: the tail is anchored to
  // the CTA, which scrolls, while the head is anchored to the launcher, which
  // doesn't. A path fixed at load detaches from the button it starts at the
  // moment the page moves. Re-measuring makes it stretch instead - which IS the
  // scroll animation, on top of the draw-in and the fade-out.
  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const y = window.scrollY
      const vh = window.innerHeight || 1
      setScrolled(Math.min(1, y / (vh * FADE_OVER)))
      // Nothing to point at once it's faded out - stop doing the maths.
      if (y >= vh * FADE_OVER) return
      setDrawn((d) => Math.max(d, Math.min(1, 0.4 + y / (vh * 0.2))))

      const cta = document.querySelector("#top [data-hero-cta]")
      if (!cta) return setGeom(null)
      const box = cta.getBoundingClientRect()
      setGeom(
        arrowGeometry(
          { x: box.right + START_OFFSET.x, y: box.bottom + START_OFFSET.y },
          launcherCenter({ width: window.innerWidth, height: window.innerHeight })
        )
      )
    }

    // Scroll fires per frame, so it gets throttled to one. Resize is discrete
    // and must NOT be: in a tab that isn't painting - offscreen, headless, a
    // background tab - requestAnimationFrame never runs, and rAF-gating the
    // resize left the arrow drawn to the previous window's measurements.
    const schedule = () => {
      frame ||= requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", measure)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Finish the draw for anyone who never scrolls.
  useEffect(() => {
    if (!ready || reducedMotion) return
    const settle = setTimeout(() => setDrawn(1), 900)
    return () => clearTimeout(settle)
  }, [ready, reducedMotion])

  // Only while the dash is still animating: once drawn, the dasharray comes off
  // entirely, so the per-frame re-measure can't leave a gap in the line.
  useEffect(() => {
    if (progress < 1 && curveRef.current) setCurveLength(curveRef.current.getTotalLength())
  }, [geom, progress])

  const visible = ready && !dismissed && scrolled < 1
  const opacity = visible ? 1 - scrolled : 0

  const label = (
    <button
      type="button"
      onClick={() => {
        openWidget()
        setDismissed(true)
      }}
      tabIndex={visible ? 0 : -1}
      className="pointer-events-auto cursor-pointer rounded-full border border-default bg-white/[0.06] px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-emphasis backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
    >
      Try it yourself
    </button>
  )

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-300 motion-reduce:transition-none"
      style={{ opacity }}
      aria-hidden={!visible}
    >
      {/* Desktop: the full sweep from the CTA to the corner. */}
      {geom && (
        <svg
          className="absolute inset-0 hidden size-full text-emphasis md:block"
          fill="none"
          aria-hidden="true"
        >
          <path
            ref={curveRef}
            d={geom.curve}
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray={progress < 1 && curveLength ? curveLength : undefined}
            strokeDashoffset={progress < 1 && curveLength ? curveLength * (1 - progress) : undefined}
            className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
          />
          <path
            d={geom.head}
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            // Only once the line has arrived - a head on a half-drawn arrow
            // points at nothing.
            className="transition-opacity duration-300"
            style={{ opacity: progress > 0.96 ? 1 : 0 }}
          />
        </svg>
      )}

      {geom && (
        <div
          // Left-aligned to the arrow's tail, not centred on it: centring puts
          // half the label back over the "Get started" button and reads as a
          // second, competing CTA.
          className="absolute hidden -translate-y-full md:block"
          style={{ left: geom.start.x + 10, top: geom.start.y - 14 }}
        >
          {label}
        </div>
      )}

      {/* Phones: stacked directly ON TOP of the launcher, not beside it. Beside
          it - which is what a sweep across the screen collapses to - the label
          lands on the hero's own centred CTA at 375×667. Above it, it labels
          the button it points at and can't collide with anything. */}
      <div className="absolute right-5 bottom-[4.75rem] flex flex-col items-end md:hidden">
        {label}
        <svg
          width="16"
          height="18"
          viewBox="0 0 16 18"
          fill="none"
          aria-hidden="true"
          className="mr-3 text-emphasis"
        >
          <path d="M8 1v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M4 8.5 8 13l4-4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
