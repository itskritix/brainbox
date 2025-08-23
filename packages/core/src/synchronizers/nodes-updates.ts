import { UpdateMergeMetadata } from '@brainbox/core';

export type SyncNodesUpdatesInput = {
  type: 'nodes.updates';
  rootId: string;
};

export type SyncNodeUpdateData = {
  id: string;
  nodeId: string;
  rootId: string;
  workspaceId: string;
  revision: string;
  data: string;
  createdAt: string;
  createdBy: string;
  mergedUpdates: UpdateMergeMetadata[] | null | undefined;
};

declare module '@brainbox/core' {
  interface SynchronizerMap {
    'nodes.updates': {
      input: SyncNodesUpdatesInput;
      data: SyncNodeUpdateData;
    };
  }
}
