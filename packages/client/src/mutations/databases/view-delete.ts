export type ViewDeleteMutationInput = {
  type: 'view.delete';
  accountId: string;
  workspaceId: string;
  viewId: string;
};

export type ViewDeleteMutationOutput = {
  id: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'view.delete': {
      input: ViewDeleteMutationInput;
      output: ViewDeleteMutationOutput;
    };
  }
}
