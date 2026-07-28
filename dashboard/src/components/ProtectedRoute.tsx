import { useSession } from "@hono/auth-js/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Spinner } from "./ui/spinner";

export function ProtectedRoute() {
  const { status } = useSession();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Spinner />
      </div>
    );
  }
  if (status === "unauthenticated") {
    // Carry where they were headed. Login turns this into the OAuth
    // callbackUrl, so a deep link survives the sign-in round trip instead of
    // everyone landing on the dashboard root with their intent discarded.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
