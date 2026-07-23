import { Resend } from "resend";

import { env } from "../env.ts";
import type { Emailer, EmailMessage } from "./types.ts";

// Prod driver. Requires RESEND_API_KEY and EMAIL_FROM on a Resend-verified
// domain. Throws on a provider error so the route can record delivery status.
export class ResendEmailer implements Emailer {
  private readonly client: Resend;

  constructor() {
    if (!env.RESEND_API_KEY) {
      throw new Error("EMAIL_DRIVER=resend requires RESEND_API_KEY");
    }
    this.client = new Resend(env.RESEND_API_KEY);
  }

  async send(msg: EmailMessage): Promise<{ id: string | null }> {
    const { data, error } = await this.client.emails.send({
      from: env.EMAIL_FROM,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
    });
    if (error) throw new Error(`Resend send failed: ${error.message}`);
    return { id: data?.id ?? null };
  }
}
