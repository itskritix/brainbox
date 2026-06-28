import { WaitlistForm } from "./waitlist-form"

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
      <div className="border-sheen bg-noise glow-top relative overflow-hidden rounded-[2rem] px-6 py-20 text-center">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-gradient mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.03em] md:text-5xl md:leading-[1.05]">
            Stop guessing what your users need.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-default">
            They tap once. You get the full story: every bug and feature request, ready to ship.
          </p>
          <div className="mt-8 flex justify-center">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  )
}
