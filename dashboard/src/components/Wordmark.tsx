import { Link } from "react-router-dom";

export function Wordmark() {
  return (
    <Link to="/" className="flex w-fit shrink-0 items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-md bg-emphasis">
        <span className="h-1.5 w-1.5 rounded-full bg-background" />
      </span>
      <span className="text-sm font-semibold tracking-tight text-emphasis">brainbox</span>
    </Link>
  );
}
