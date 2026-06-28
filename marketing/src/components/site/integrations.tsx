import type { ReactNode } from "react"
import { SectionHead } from "./section-head"

const LinearIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden>
    <path d="M2.9 13.4a9.1 9.1 0 0 0 7.7 7.7L2.9 13.4zM2.05 9.9 14.1 21.95a9.05 9.05 0 0 0 2.5-.86L2.9 7.4a9 9 0 0 0-.85 2.5zM4 5.6 18.4 20a9.1 9.1 0 0 0 1.6-1.6L5.6 4A9.1 9.1 0 0 0 4 5.6zM7.4 2.9 21.1 16.6c.4-.8.7-1.6.86-2.5L9.9 2.05c-.9.16-1.7.45-2.5.85zM12.9 2.06l8.04 8.04A9.1 9.1 0 0 0 12.9 2.06z" />
  </svg>
)

const GithubIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
)

const SlackIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden>
    <path d="M5.5 14.5A2 2 0 1 1 3.5 12.5h2zM6.5 14.5a2 2 0 0 1 4 0v5a2 2 0 1 1-4 0z" />
    <path d="M9.5 5.5a2 2 0 1 1 2-2v2zM9.5 6.5a2 2 0 0 1 0 4h-5a2 2 0 1 1 0-4z" />
    <path d="M18.5 9.5a2 2 0 1 1 2 2h-2zM17.5 9.5a2 2 0 0 1-4 0v-5a2 2 0 1 1 4 0z" />
    <path d="M14.5 18.5a2 2 0 1 1-2 2v-2zM14.5 17.5a2 2 0 0 1 0-4h5a2 2 0 1 1 0 4z" />
  </svg>
)

const GmailIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden>
    <path d="M3 6.5 12 13l9-6.5V18a1.5 1.5 0 0 1-1.5 1.5H18V9.8l-6 4.3-6-4.3v9.7H4.5A1.5 1.5 0 0 1 3 18z" />
  </svg>
)

const integrations: { name: string; sub: string; icon: ReactNode }[] = [
  { name: "Linear", sub: "Issues", icon: LinearIcon },
  { name: "GitHub", sub: "Issues", icon: GithubIcon },
  { name: "Slack", sub: "Messages", icon: SlackIcon },
  { name: "Gmail", sub: "Email", icon: GmailIcon },
]

export function Integrations() {
  return (
    <section id="integrations" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHead
        label="Integrations"
        title="Lands where your team works."
        desc="One ticket, routed to the tools you already use. No copy-paste, no context switching."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {integrations.map((it) => (
          <div
            key={it.name}
            className="border-sheen flex flex-col items-center gap-4 rounded-2xl px-6 py-8 text-center transition-colors duration-200 hover:border-white/15"
          >
            <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-default bg-white/[0.03] text-emphasis">
              {it.icon}
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-emphasis">{it.name}</h3>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-default">
                {it.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center font-mono text-sm text-default">
        …and <span className="text-emphasis">any tool</span> via webhooks &amp; API.
      </p>
    </section>
  )
}
