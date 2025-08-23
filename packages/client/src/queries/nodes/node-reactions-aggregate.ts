import { NodeReactionCount } from '@brainbox/client/types/nodes';

export type NodeReactionsAggregateQueryInput = {
  type: 'node.reactions.aggregate';
  nodeId: string;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'node.reactions.aggregate': {
      input: NodeReactionsAggregateQueryInput;
      output: NodeReactionCount[];
    };
  }
}
