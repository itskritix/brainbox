import { Navigate, useParams } from "react-router-dom";

import { IssueDetailPane } from "../components/IssueDetailPane";
import { useProject } from "../lib/useProject";

export function Report() {
  const { project } = useProject();
  const { issueId } = useParams<{ issueId: string }>();
  if (!issueId) return null;
  // All-view rows link to the issue's real project, so this only happens on a
  // hand-typed /projects/all/issues/:id URL.
  if (!project) return <Navigate to="/projects/all" replace />;
  return (
    <div className="min-h-0 flex-1 lg:overflow-y-auto">
      {/* keyed so each report starts from its own loading state */}
      <IssueDetailPane key={issueId} issueId={issueId} projectId={project.id} />
    </div>
  );
}
