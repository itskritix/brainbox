import { describe, expect, it, vi } from "vitest";

import { getAuthConfig } from "../src/auth/config.ts";
import * as emailModule from "../src/email/index.ts";
import { magicLinkEmail } from "../src/email/templates/magic-link.ts";

const URL_UNDER_TEST = "https://api.brainbox.sh/api/auth/callback/magic-link?token=abc123";

function magicLinkProvider() {
  const provider = getAuthConfig().providers.find(
    (p) => "id" in p && p.id === "magic-link",
  );
  if (!provider || !("sendVerificationRequest" in provider)) {
    throw new Error("magic-link provider is not registered");
  }
  return provider;
}

describe("magic-link provider", () => {
  it("is registered alongside Google", () => {
    const ids = getAuthConfig().providers.map((p) => ("id" in p ? p.id : null));
    expect(ids).toContain("magic-link");
    expect(ids).toContain("google");
  });

  it("is an email-type provider so Auth.js uses verificationTokens", () => {
    const provider = magicLinkProvider();
    expect("type" in provider && provider.type).toBe("email");
  });

  it("expires links in 15 minutes - a leaked mail stops working quickly", () => {
    const provider = magicLinkProvider();
    expect("maxAge" in provider && provider.maxAge).toBe(15 * 60);
  });

  it("sends the link through the configured emailer", async () => {
    const send = vi.fn().mockResolvedValue({ id: "msg_1" });
    vi.spyOn(emailModule, "getEmailer").mockReturnValue({ send });

    const provider = magicLinkProvider();
    await provider.sendVerificationRequest({
      identifier: "founder@acme.com",
      url: URL_UNDER_TEST,
      // The remaining params are unused by our implementation.
    } as Parameters<typeof provider.sendVerificationRequest>[0]);

    expect(send).toHaveBeenCalledOnce();
    const msg = send.mock.calls[0]?.[0] as { to: string; html: string; text: string };
    expect(msg.to).toBe("founder@acme.com");
    expect(msg.html).toContain(URL_UNDER_TEST);
    expect(msg.text).toContain(URL_UNDER_TEST);

    vi.restoreAllMocks();
  });

  it("surfaces a send failure instead of silently swallowing it", async () => {
    const send = vi.fn().mockRejectedValue(new Error("resend down"));
    vi.spyOn(emailModule, "getEmailer").mockReturnValue({ send });

    const provider = magicLinkProvider();
    await expect(
      provider.sendVerificationRequest({
        identifier: "founder@acme.com",
        url: URL_UNDER_TEST,
      } as Parameters<typeof provider.sendVerificationRequest>[0]),
    ).rejects.toThrow("resend down");

    vi.restoreAllMocks();
  });
});

describe("magicLinkEmail", () => {
  it("puts the one-time url in both the html and text parts", () => {
    const mail = magicLinkEmail(URL_UNDER_TEST, 15);
    expect(mail.html).toContain(`href="${URL_UNDER_TEST}"`);
    expect(mail.text).toContain(URL_UNDER_TEST);
  });

  it("states the expiry so the link never looks broken when it lapses", () => {
    const mail = magicLinkEmail(URL_UNDER_TEST, 15);
    expect(mail.html).toContain("15 minutes");
    expect(mail.text).toContain("15 minutes");
  });

  it("tells an unexpecting recipient they can ignore it", () => {
    const mail = magicLinkEmail(URL_UNDER_TEST, 15);
    expect(mail.text.toLowerCase()).toContain("ignore this email");
  });
});
