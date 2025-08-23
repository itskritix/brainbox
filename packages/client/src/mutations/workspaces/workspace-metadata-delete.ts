export type WorkspaceMetadataDeleteMutationInput = {
  type: 'workspace.metadata.delete';
  accountId: string;
  workspaceId: string;
  key: string;
};

export type WorkspaceMetadataDeleteMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'workspace.metadata.delete': {
      input: WorkspaceMetadataDeleteMutationInput;
      output: WorkspaceMetadataDeleteMutationOutput;
    };
  }
}
