export type RecordNameUpdateMutationInput = {
  type: 'record.name.update';
  accountId: string;
  workspaceId: string;
  recordId: string;
  name: string;
};

export type RecordNameUpdateMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'record.name.update': {
      input: RecordNameUpdateMutationInput;
      output: RecordNameUpdateMutationOutput;
    };
  }
}
