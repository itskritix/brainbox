import { useParams } from "react-router-dom";

import { IssueDetailPane } from "../components/IssueDetailPane";
import { useProject } from "../lib/useProject";

export function Report() {
  const { project } = useProject();
  const { issueId } = useParams<{ issueId: string }>();
  if (!issueId) return null;
  return (
    <div className="min-h-0 flex-1 lg:overflow-y-auto">
      {/* keyed so each report starts from its own loading state */}
      <IssueDetailPane key={issueId} issueId={issueId} projectId={project.id} />
    </div>
  );
}
