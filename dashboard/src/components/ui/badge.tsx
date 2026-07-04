import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] leading-4 [&_svg]:size-2.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-default text-muted",
        error: "border-error-subtle bg-error text-error",
        success: "border-success-subtle bg-success text-success",
        info: "border-info-subtle bg-info text-info",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />
  )
}

export { Badge }
