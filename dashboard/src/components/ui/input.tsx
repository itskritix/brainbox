import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-interactive bg-interactive px-3 text-sm text-emphasis placeholder:text-placeholder outline-none transition focus-visible:ring-[3px] focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
