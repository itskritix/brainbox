import { useSession } from "@hono/auth-js/react";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const { status } = useSession();
  if (status === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-muted">
        Loading…
      </div>
    );
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
