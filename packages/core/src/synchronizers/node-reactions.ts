export type SyncNodeReactionsInput = {
  type: 'node.reactions';
  rootId: string;
};

export type SyncNodeReactionData = {
  nodeId: string;
  collaboratorId: string;
  reaction: string;
  rootId: string;
  workspaceId: string;
  revision: string;
  createdAt: string;
  deletedAt: string | null;
};

declare module '@brainbox/core' {
  interface SynchronizerMap {
    'node.reactions': {
      input: SyncNodeReactionsInput;
      data: SyncNodeReactionData;
    };
  }
}
