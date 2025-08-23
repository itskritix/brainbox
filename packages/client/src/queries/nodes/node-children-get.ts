import { LocalNode } from '@brainbox/client/types/nodes';
import { NodeType } from '@brainbox/core';

export type NodeChildrenGetQueryInput = {
  type: 'node.children.get';
  nodeId: string;
  accountId: string;
  workspaceId: string;
  types?: NodeType[];
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'node.children.get': {
      input: NodeChildrenGetQueryInput;
      output: LocalNode[];
    };
  }
}
