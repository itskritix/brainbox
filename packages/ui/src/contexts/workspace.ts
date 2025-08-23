import { createContext, useContext } from 'react';

import {
  Workspace,
  WorkspaceMetadataKey,
  WorkspaceMetadataMap,
} from '@brainbox/client/types';

interface WorkspaceContext extends Workspace {
  getMetadata: <K extends WorkspaceMetadataKey>(
    key: K
  ) => WorkspaceMetadataMap[K] | undefined;
  setMetadata: <K extends WorkspaceMetadataKey>(
    key: K,
    value: WorkspaceMetadataMap[K]['value']
  ) => void;
  deleteMetadata: <K extends WorkspaceMetadataKey>(key: K) => void;
}

export const WorkspaceContext = createContext<WorkspaceContext>(
  {} as WorkspaceContext
);

export const useWorkspace = () => useContext(WorkspaceContext);
