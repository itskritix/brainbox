import { describe, expect, it } from "vitest";

import { earlyAccessReservedEmail } from "./early-access.ts";

describe("earlyAccessReservedEmail", () => {
  const email = earlyAccessReservedEmail();

  it("renders a subject with html and text bodies", () => {
    expect(email.subject).toBe("Your Brainbox early access is reserved");
    expect(email.html).toContain("<html>");
    expect(email.text.trim().length).toBeGreaterThan(0);
  });

  it("is signed by Ganesh, not a team alias", () => {
    expect(email.text).toContain("Ganesh");
    expect(email.html).toContain("Ganesh");
    expect(email.text).not.toContain("The Brainbox team");
    expect(email.html).not.toContain("The Brainbox team");
  });

  it("uses no em dashes (house style)", () => {
    for (const body of [email.text, email.html]) {
      expect(body).not.toContain("—"); // — em dash
      expect(body).not.toContain("&mdash;");
    }
  });
});
