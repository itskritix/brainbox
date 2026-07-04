import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProjectLayout } from "./components/ProjectLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { LegacyIssue } from "./pages/LegacyIssue";
import { Login } from "./pages/Login";
import { Report } from "./pages/Report";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/projects/:projectId",
        element: <ProjectLayout />,
        children: [
          { index: true, element: <Reports /> },
          { path: "issues/:issueId", element: <Report /> },
          { path: "settings", element: <Settings /> },
        ],
      },
      // old deep links from before the inbox routes
      { path: "/issues/:id", element: <LegacyIssue /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
