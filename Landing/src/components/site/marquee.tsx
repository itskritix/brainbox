const items = ["Voice", "Screenshot", "Page context", "Browser metadata", "Auto-tickets"]

export function Marquee() {
  // duplicate the group so translateX(-50%) loops seamlessly
  const half = [...items, ...items, ...items, ...items]
  const track = [...half, ...half]

  return (
    <div className="relative overflow-hidden border-y border-border bg-white/[0.01] py-5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="animate-marquee flex w-max">
        {track.map((label, i) => (
          <span
            key={i}
            className="flex items-center gap-10 whitespace-nowrap px-5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70"
          >
            {label}
            <span className="size-1 rounded-full bg-muted-foreground/40" />
          </span>
        ))}
      </div>
    </div>
  )
}
