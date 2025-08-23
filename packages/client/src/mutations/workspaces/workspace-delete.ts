export type WorkspaceDeleteMutationInput = {
  type: 'workspace.delete';
  accountId: string;
  workspaceId: string;
};

export type WorkspaceDeleteMutationOutput = {
  id: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'workspace.delete': {
      input: WorkspaceDeleteMutationInput;
      output: WorkspaceDeleteMutationOutput;
    };
  }
}
