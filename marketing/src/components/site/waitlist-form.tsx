import { useState, type FormEvent } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reserveAccess } from "@/lib/waitlist"
import { cn } from "@/lib/utils"

/** `inputId` lets another section send the visitor here and focus the field -
 *  the pricing CTAs do this, and a scroll with no focus reads as a dead click. */
export function WaitlistForm({
  className,
  inputId,
}: {
  className?: string
  inputId?: string
}) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || status === "submitting") return
    setStatus("submitting")
    setError(null)
    const result = await reserveAccess(email)
    if (result.ok) {
      setStatus("done")
    } else {
      setError(result.error)
      setStatus("idle")
    }
  }

  if (status === "done") {
    return (
      <div
        className={cn(
          "flex h-11 w-full max-w-md items-center justify-center gap-2 rounded-xl border border-default bg-white/[0.03] px-4 text-sm text-emphasis",
          className,
        )}
      >
        <Check className="size-4" />
        You&rsquo;re on the list. Check your inbox to confirm your spot.
      </div>
    )
  }

  const submitting = status === "submitting"

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-2", className)}>
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center"
      >
        <input
          id={inputId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          placeholder="you@company.com"
          aria-label="Email address"
          aria-invalid={error ? true : undefined}
          className="h-11 w-full min-w-0 appearance-none rounded-xl border border-default bg-white/[0.03] px-4 text-base text-emphasis outline-none transition-colors placeholder:text-default focus:border-white/25 disabled:opacity-60 sm:flex-1 sm:text-sm"
        />
        <Button type="submit" size="lg" disabled={submitting} className="h-11 w-full sm:w-auto">
          {submitting ? (
            <>
              Reserving
              <Loader2 className="size-4 animate-spin" />
            </>
          ) : (
            "Reserve access"
          )}
        </Button>
      </form>
      {error && (
        <p role="alert" aria-live="polite" className="px-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
