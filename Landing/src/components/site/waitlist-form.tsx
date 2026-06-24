import { useState, type FormEvent } from "react"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function WaitlistForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return
    // TODO: wire to a Resend audience / Cloudflare Pages Function for real capture.
    setDone(true)
  }

  if (done) {
    return (
      <div
        className={cn(
          "flex h-11 w-full max-w-md items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.03] px-4 text-sm text-foreground",
          className,
        )}
      >
        <Check className="size-4" />
        You&rsquo;re on the list. We&rsquo;ll be in touch soon.
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex w-full max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        aria-label="Email address"
        className="h-11 w-full min-w-0 flex-1 rounded-xl border border-border bg-white/[0.03] px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-white/25"
      />
      <Button type="submit" size="lg" className="h-11 w-full sm:w-auto">
        Reserve access
        <ArrowRight className="size-4" />
      </Button>
    </form>
  )
}
