import { describe, expect, it } from "vitest";

import { generateProjectKey } from "./projectKey.ts";

describe("generateProjectKey", () => {
  it("is pk_ followed by 24 base62 chars", () => {
    expect(generateProjectKey()).toMatch(/^pk_[0-9A-Za-z]{24}$/);
  });

  it("is unique across 1000 calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(generateProjectKey());
    expect(seen.size).toBe(1000);
  });
});
