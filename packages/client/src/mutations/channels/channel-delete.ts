export type ChannelDeleteMutationInput = {
  type: 'channel.delete';
  accountId: string;
  workspaceId: string;
  channelId: string;
};

export type ChannelDeleteMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'channel.delete': {
      input: ChannelDeleteMutationInput;
      output: ChannelDeleteMutationOutput;
    };
  }
}
