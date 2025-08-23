export type ChatCreateMutationInput = {
  type: 'chat.create';
  accountId: string;
  workspaceId: string;
  userId: string;
};

export type ChatCreateMutationOutput = {
  id: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'chat.create': {
      input: ChatCreateMutationInput;
      output: ChatCreateMutationOutput;
    };
  }
}
