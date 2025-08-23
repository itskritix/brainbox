import { LocalChatNode } from '@brainbox/client/types/nodes';

export type ChatListQueryInput = {
  type: 'chat.list';
  page: number;
  count: number;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'chat.list': {
      input: ChatListQueryInput;
      output: LocalChatNode[];
    };
  }
}
