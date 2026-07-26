import { useState, type FormEvent } from "react";
import { signIn } from "@hono/auth-js/react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";

type Status = "idle" | "sending" | "sent" | "error";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  );
}

export function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const address = email.trim();
    if (!address || status === "sending") return;
    setStatus("sending");
    try {
      // redirect:false keeps the user here so we can say "check your inbox"
      // rather than bouncing them to the Auth.js default verify-request page.
      await signIn("magic-link", { email: address, redirect: false });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-default bg-elevated p-8">
          <img
            src="/assets/brainbox-logo.png"
            alt="Brainbox"
            className="h-9 w-9 object-contain"
            width={36}
            height={36}
          />
          <h1 className="mt-6 text-xl font-semibold tracking-tight text-emphasis">
            Welcome to Brainbox
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to read the feedback coming out of your app.
          </p>

          <Button
            variant="secondary"
            className="mt-7 w-full"
            onClick={() => signIn("google", { callbackUrl: window.location.origin })}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-subtle" />
            <span className="text-xs text-muted">or</span>
            <span className="h-px flex-1 bg-subtle" />
          </div>

          {status === "sent" ? (
            <div
              role="status"
              className="rounded-lg border border-default bg-interactive px-4 py-3 text-sm text-emphasis"
            >
              Check <span className="font-medium">{email}</span> for a sign-in link.
              It expires in 15 minutes.
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-2 block text-xs text-muted underline underline-offset-4 hover:text-emphasis"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <label htmlFor="email" className="text-sm text-emphasis">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
              <Button
                type="submit"
                className="mt-3 w-full"
                disabled={status === "sending" || !email.trim()}
              >
                {status === "sending" ? <Spinner /> : "Send me a sign-in link"}
              </Button>
              {status === "error" && (
                <p role="alert" className="mt-3 text-sm text-error">
                  Couldn&rsquo;t send the link. Try again, or use Google.
                </p>
              )}
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          No password to remember. We&rsquo;ll email you a link that signs you in.
        </p>
      </div>
    </div>
  );
}
