import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { IssueDetail } from "./pages/IssueDetail";
import { Login } from "./pages/Login";
import { ProjectIssues } from "./pages/ProjectIssues";
import { ProjectSettings } from "./pages/ProjectSettings";
import { Projects } from "./pages/Projects";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <Projects /> },
      { path: "/projects/:id", element: <ProjectIssues /> },
      { path: "/projects/:id/settings", element: <ProjectSettings /> },
      { path: "/issues/:id", element: <IssueDetail /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
