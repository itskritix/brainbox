import { cn } from "@/lib/utils"

interface SectionHeadProps {
  label: string
  title: string
  desc?: string
  center?: boolean
}

export function SectionHead({ label, title, desc, center = true }: SectionHeadProps) {
  return (
    <div className={cn("mb-14 max-w-2xl", center && "mx-auto text-center")}>
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.6rem] md:leading-[1.05]">
        {title}
      </h2>
      {desc && (
        <p className={cn("mt-4 max-w-xl text-muted-foreground", center && "mx-auto")}>
          {desc}
        </p>
      )}
    </div>
  )
}
