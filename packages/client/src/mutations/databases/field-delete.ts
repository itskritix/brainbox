export type FieldDeleteMutationInput = {
  type: 'field.delete';
  accountId: string;
  workspaceId: string;
  databaseId: string;
  fieldId: string;
};

export type FieldDeleteMutationOutput = {
  id: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'field.delete': {
      input: FieldDeleteMutationInput;
      output: FieldDeleteMutationOutput;
    };
  }
}
