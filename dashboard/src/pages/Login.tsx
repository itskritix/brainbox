import { signIn } from "@hono/auth-js/react";

import { Button } from "../components/ui/button";

export function Login() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-sm">
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-emphasis">
          <span className="h-2.5 w-2.5 rounded-full bg-background" />
        </span>
        <h1 className="mt-6 text-center text-xl font-semibold tracking-tight text-emphasis">
          Sign in to Brainbox
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Feedback from your app, with the evidence attached.
        </p>
        <Button
          className="mt-8 w-full"
          onClick={() => signIn("google", { callbackUrl: window.location.origin })}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
