const cols = [
  { h: "Product", links: ["How it works", "Integrations", "Pricing", "Changelog"] },
  { h: "Company", links: ["About", "Roadmap", "Contact"] },
  { h: "Connect", links: ["Twitter / X", "GitHub", "Email founder"] },
]

export function Footer() {
  return (
    <footer className="border-t border-default">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <img
                src="/assets/brainbox-logo.png"
                alt="Brainbox"
                className="size-7 object-contain"
                width={28}
                height={28}
              />
              <span className="text-[15px] font-semibold tracking-tight text-emphasis">
                Brainbox
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-default">
              The voice-powered feedback widget for SaaS. Users talk, Brainbox writes
              developer-ready tickets.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.h}>
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-default">
                {c.h}
              </h3>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-default transition-colors hover:text-emphasis">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-default pt-6 font-mono text-xs text-gray-11/70 sm:flex-row">
          <span>© 2026 Brainbox. Built for builders.</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  )
}
