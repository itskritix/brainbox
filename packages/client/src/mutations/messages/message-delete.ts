export type MessageDeleteMutationInput = {
  type: 'message.delete';
  accountId: string;
  workspaceId: string;
  messageId: string;
};

export type MessageDeleteMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'message.delete': {
      input: MessageDeleteMutationInput;
      output: MessageDeleteMutationOutput;
    };
  }
}
