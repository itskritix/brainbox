import { LocalNode } from '@brainbox/client/types/nodes';

export type NodeGetQueryInput = {
  type: 'node.get';
  nodeId: string;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'node.get': {
      input: NodeGetQueryInput;
      output: LocalNode | null;
    };
  }
}
