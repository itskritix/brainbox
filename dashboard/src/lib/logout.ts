import { signOut } from "@hono/auth-js/react";

import { LAST_PROJECT_KEY } from "./useProject";

/**
 * Sign out, and leave nothing of this Account behind.
 *
 * A bare `signOut()` clears the session cookie and nothing else, so
 * `brainbox:lastProject` survived into the next sign-in - the next person to
 * use the browser got redirected towards the previous Account's project, or
 * landed on the all-projects view they never chose. The full page navigation
 * takes care of in-memory state; localStorage is the part that needed saying.
 *
 * Sending them to /login explicitly (rather than signOut's default of "the page
 * you were on") avoids bouncing through a protected route that immediately
 * redirects, which showed up as a flash of the spinner and a second navigation.
 */
export async function logout(): Promise<void> {
  try {
    localStorage.removeItem(LAST_PROJECT_KEY);
  } catch {
    // Private mode / storage disabled. Signing out still has to work.
  }
  await signOut({ callbackUrl: `${window.location.origin}/login` });
}
