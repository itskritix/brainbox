// The sign-in link sent when someone enters their email instead of using
// Google. Same shape as the other templates: a subject + html + text triple the
// caller hands to the active emailer. Inline styles only (email clients strip
// <style>/external CSS).

import type { RenderedEmail } from "./early-access.ts";

/**
 * @param url  The one-time callback URL Auth.js generated. Never log it - it is
 *             a bearer credential for the duration of `expiresMinutes`.
 */
export function magicLinkEmail(url: string, expiresMinutes: number): RenderedEmail {
  const subject = "Your Brainbox sign-in link";

  const text = [
    "Sign in to Brainbox.",
    "",
    "Open this link and you're in - no password to remember:",
    url,
    "",
    `The link works once and expires in ${expiresMinutes} minutes.`,
    "",
    "If you didn't ask to sign in, you can ignore this email. Nobody can get",
    "into your account without the link above.",
    "",
    "Ganesh",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111111;border:1px solid #262626;border-radius:16px;padding:32px;">
            <tr>
              <td>
                <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;font-weight:600;color:#fafafa;letter-spacing:-0.02em;">
                  Sign in to Brainbox
                </h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#a3a3a3;">
                  Click the button below and you're in - no password to remember.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:10px;background:#fafafa;">
                      <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#0a0a0a;text-decoration:none;border-radius:10px;">
                        Sign in
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#737373;">
                  The link works once and expires in ${expiresMinutes} minutes.
                </p>
                <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#737373;">
                  If you didn't ask to sign in, you can ignore this email. Nobody
                  can get into your account without this link.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
