import { useEffect } from 'react';

import { Node } from '@brainbox/core';
import { useRadar } from '@brainbox/ui/contexts/radar';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';

export const useNodeRadar = (node: Node | null | undefined) => {
  const workspace = useWorkspace();
  const radar = useRadar();

  useEffect(() => {
    if (!node) {
      return;
    }

    radar.markNodeAsOpened(workspace.accountId, workspace.id, node.id);

    const interval = setInterval(() => {
      radar.markNodeAsOpened(workspace.accountId, workspace.id, node.id);
    }, 60000);

    return () => clearInterval(interval);
  }, [node?.id]);
};
