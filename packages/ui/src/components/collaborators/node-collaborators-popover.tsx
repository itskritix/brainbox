import { UserRoundPlus } from 'lucide-react';

import { Node, NodeRole } from '@colanode/core';
import { NodeCollaborators } from '@colanode/ui/components/collaborators/node-collaborators';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@colanode/ui/components/ui/popover';

interface NodeCollaboratorsPopoverProps {
  node: Node;
  nodes: Node[];
  role: NodeRole;
}

export const NodeCollaboratorsPopover = ({
  node,
  nodes,
  role,
}: NodeCollaboratorsPopoverProps) => {
  // Hide collaborators popover for DMs between exactly 2 people
  if (node.type === 'chat') {
    const collaboratorCount = Object.keys(node.attributes.collaborators || {}).length;
    if (collaboratorCount <= 2) {
      return null;
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <UserRoundPlus className="size-5 cursor-pointer text-muted-foreground hover:text-foreground" />
      </PopoverTrigger>
      <PopoverContent className="mr-2 max-h-128 w-128 overflow-auto">
        <NodeCollaborators node={node} nodes={nodes} role={role} />
      </PopoverContent>
    </Popover>
  );
};
