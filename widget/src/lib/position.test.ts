import { describe, expect, it } from "vitest";
import { posClass } from "./position.ts";

describe("posClass", () => {
  it("maps each corner to its anchor classes", () => {
    expect(posClass("bottom-right")).toBe("bottom-5 right-5");
    expect(posClass("bottom-left")).toBe("bottom-5 left-5");
    expect(posClass("top-right")).toBe("top-5 right-5");
    expect(posClass("top-left")).toBe("top-5 left-5");
  });
});
