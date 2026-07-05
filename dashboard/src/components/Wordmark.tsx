import { Link } from "react-router-dom";

export function Wordmark() {
  return (
    <Link to="/" className="flex w-fit shrink-0 items-center gap-2">
      <img
        src="/assets/brainbox-logo.png"
        alt=""
        className="h-5 w-5 object-contain"
        width={20}
        height={20}
      />
      <span className="text-sm font-semibold tracking-tight text-emphasis">brainbox</span>
    </Link>
  );
}
