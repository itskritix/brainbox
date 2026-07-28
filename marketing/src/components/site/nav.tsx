import { Button } from "@/components/ui/button"
import { dashboardUrl } from "@/lib/signup"

const links = [
  { href: "#how", label: "How it works" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
]

export function Nav() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-default bg-black/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <img
            src="/assets/brainbox-logo.png"
            alt="Brainbox"
            className="size-7 object-contain"
            width={28}
            height={28}
          />
          <span className="text-[15px] font-semibold tracking-tight text-emphasis">Brainbox</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-default md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-emphasis">
              {l.label}
            </a>
          ))}
        </nav>

        <Button asChild size="sm">
          <a href={dashboardUrl()}>Sign in</a>
        </Button>
      </div>
    </header>
  )
}
