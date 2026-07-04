import { describe, expect, it } from "vitest";
import { cn } from "./utils.ts";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-2", "text-sm")).toBe("px-2 text-sm");
  });

  it("lets a later tailwind class win over a conflicting earlier one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", false, null, undefined, "text-sm")).toBe("px-2 text-sm");
  });
});
