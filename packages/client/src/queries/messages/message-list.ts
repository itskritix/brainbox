import { LocalMessageNode } from '@brainbox/client/types/nodes';

export type MessageListQueryInput = {
  type: 'message.list';
  conversationId: string;
  page: number;
  count: number;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'message.list': {
      input: MessageListQueryInput;
      output: LocalMessageNode[];
    };
  }
}
