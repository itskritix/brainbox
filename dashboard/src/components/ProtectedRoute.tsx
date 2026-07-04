import { useSession } from "@hono/auth-js/react";
import { Navigate, Outlet } from "react-router-dom";

import { Spinner } from "./ui/spinner";

export function ProtectedRoute() {
  const { status } = useSession();
  if (status === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Spinner />
      </div>
    );
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
