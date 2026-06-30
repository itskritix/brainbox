import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SessionProvider } from "@hono/auth-js/react";
import { RouterProvider } from "react-router-dom";

import "./index.css";
import "./lib/authConfig";
import { router } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </StrictMode>,
);
