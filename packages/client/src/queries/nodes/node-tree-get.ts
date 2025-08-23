import { LocalNode } from '@brainbox/client/types/nodes';

export type NodeTreeGetQueryInput = {
  type: 'node.tree.get';
  nodeId: string;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'node.tree.get': {
      input: NodeTreeGetQueryInput;
      output: LocalNode[];
    };
  }
}
