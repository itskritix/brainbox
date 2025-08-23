export type DatabaseDeleteMutationInput = {
  type: 'database.delete';
  accountId: string;
  workspaceId: string;
  databaseId: string;
};

export type DatabaseDeleteMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'database.delete': {
      input: DatabaseDeleteMutationInput;
      output: DatabaseDeleteMutationOutput;
    };
  }
}
