import type { Emailer, EmailMessage } from "./types.ts";

// Dev/test driver: logs the message instead of sending it. No network, no keys,
// so the whole waitlist flow works locally and in CI. Swap EMAIL_DRIVER=resend
// (with RESEND_API_KEY) to actually deliver.
export class ConsoleEmailer implements Emailer {
  async send(msg: EmailMessage): Promise<{ id: string | null }> {
    console.log(
      `[email:console] to=${msg.to} subject=${JSON.stringify(msg.subject)}\n${msg.text}`,
    );
    return { id: null };
  }
}
