import { LocalNode } from '@brainbox/client/types/nodes';

export const isNodeSynced = (node: LocalNode): boolean => {
  if (typeof node.serverRevision === 'string') {
    return node.serverRevision !== '0';
  }

  if (typeof node.serverRevision === 'number') {
    return node.serverRevision > 0;
  }

  return false;
};
