import { NodeReaction } from '@brainbox/client/types/nodes';

export type NodeReactionListQueryInput = {
  type: 'node.reaction.list';
  nodeId: string;
  reaction: string;
  accountId: string;
  workspaceId: string;
  page: number;
  count: number;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'node.reaction.list': {
      input: NodeReactionListQueryInput;
      output: NodeReaction[];
    };
  }
}
