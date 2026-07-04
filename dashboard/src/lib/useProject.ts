import { useOutletContext } from "react-router-dom";
import type { Project } from "@brainbox/shared";

/** Context provided by ProjectLayout to every project-scoped page. */
export interface ProjectOutletContext {
  project: Project;
  projects: Project[];
  /** Patch the project in the layout's cache after a mutation. */
  setProject: (next: Project) => void;
}

export function useProject(): ProjectOutletContext {
  return useOutletContext<ProjectOutletContext>();
}
