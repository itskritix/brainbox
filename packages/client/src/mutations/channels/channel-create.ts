export type ChannelCreateMutationInput = {
  type: 'channel.create';
  accountId: string;
  workspaceId: string;
  name: string;
  avatar?: string | null;
};

export type ChannelCreateMutationOutput = {
  id: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'channel.create': {
      input: ChannelCreateMutationInput;
      output: ChannelCreateMutationOutput;
    };
  }
}
