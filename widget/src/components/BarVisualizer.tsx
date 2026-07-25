import { memo } from "react";
import { barHeight } from "../lib/multiband.ts";

/** A row of level bars, themed with brainbox tokens rather than the shadcn ones
 *  ElevenLabs UI's `bar-visualizer` ships with. `dimFrom` greys everything at or
 *  past that index, which is how a recorded clip doubles as a playback scrubber. */
export const BarRow = memo(function BarRow({
  levels,
  dimFrom,
}: {
  levels: readonly number[];
  dimFrom?: number;
}) {
  return (
    <span className="flex h-9 flex-1 items-center gap-[2px]" aria-hidden="true">
      {levels.map((level, i) => (
        <Bar key={i} height={barHeight(level)} dim={dimFrom !== undefined && i >= dimFrom} />
      ))}
    </span>
  );
});

/** Memoised per bar: a talking user repaints this row ~30x a second. */
const Bar = memo(function Bar({ height, dim }: { height: number; dim: boolean }) {
  return (
    <span
      className="w-full min-w-[2px] rounded-full transition-[height,opacity] duration-100"
      style={{ height: `${height}%`, background: "var(--text-emphasis)", opacity: dim ? 0.2 : 1 }}
    />
  );
});
