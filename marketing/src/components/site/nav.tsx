import { Button } from "@/components/ui/button"

const links = [
  { href: "#how", label: "How it works" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
]

export function Nav() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-border bg-black/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <img
            src="/assets/brainbox-logo.png"
            alt="Brainbox"
            className="size-7 object-contain"
            width={28}
            height={28}
          />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">Brainbox</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex">
            <a href="#how">Sign in</a>
          </Button>
          <Button asChild size="sm">
            <a href="#pricing">Reserve access</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
