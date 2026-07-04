import * as React from "react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(
        "size-5 animate-spin rounded-full border-2 border-gray-a4 border-t-gray-11",
        className,
      )}
      {...props}
    />
  )
}

export { Spinner }
