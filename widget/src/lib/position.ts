export type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

/** Tailwind anchor classes for a fixed element pinned to a viewport corner. */
export function posClass(p: Position): string {
  switch (p) {
    case "bottom-left":
      return "bottom-5 left-5";
    case "top-right":
      return "top-5 right-5";
    case "top-left":
      return "top-5 left-5";
    default:
      return "bottom-5 right-5";
  }
}
