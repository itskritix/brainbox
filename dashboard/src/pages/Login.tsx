import { signIn } from "@hono/auth-js/react";

import { Button } from "../components/ui/button";

export function Login() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="border-sheen w-full max-w-sm rounded-3xl bg-elevated p-10 text-center">
        <h1 className="text-2xl font-semibold text-emphasis">Brainbox</h1>
        <p className="mt-2 text-sm text-default">
          Sign in to view your projects and feedback.
        </p>
        <Button
          className="mt-8 w-full"
          onClick={() => signIn("google", { callbackUrl: window.location.origin })}
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
