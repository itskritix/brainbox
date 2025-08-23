import { useState } from 'react';
import { toast } from 'sonner';

import { User } from '@brainbox/client/types';
import { NodeRole } from '@brainbox/core';
import { NodeCollaboratorRoleDropdown } from '@brainbox/ui/components/collaborators/node-collaborator-role-dropdown';
import { NodeCollaboratorSearch } from '@brainbox/ui/components/collaborators/node-collaborator-search';
import { Button } from '@brainbox/ui/components/ui/button';
import { Spinner } from '@brainbox/ui/components/ui/spinner';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

interface NodeCollaboratorCreateProps {
  nodeId: string;
  existingCollaborators: string[];
}

export const NodeCollaboratorCreate = ({
  nodeId,
  existingCollaborators,
}: NodeCollaboratorCreateProps) => {
  const workspace = useWorkspace();
  const { mutate, isPending } = useMutation();

  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<NodeRole>('editor');

  return (
    <div className="flex flex-col gap-2">
      <NodeCollaboratorSearch
        value={users}
        onChange={setUsers}
        excluded={existingCollaborators}
      />
      <div className="flex justify-end space-x-2">
        <NodeCollaboratorRoleDropdown
          value={role}
          onChange={setRole}
          canEdit={true}
        />
        <Button
          variant="default"
          className="shrink-0"
          size="sm"
          disabled={users.length === 0 || isPending}
          onClick={() => {
            if (isPending) {
              return;
            }

            mutate({
              input: {
                type: 'node.collaborator.create',
                nodeId,
                collaboratorIds: users.map((user) => user.id),
                role: role,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
              },
              onSuccess() {
                setUsers([]);
              },
              onError(error) {
                toast.error(error.message);
              },
            });
          }}
        >
          {isPending && <Spinner className="mr-1" />}
          Invite
        </Button>
      </div>
    </div>
  );
};
