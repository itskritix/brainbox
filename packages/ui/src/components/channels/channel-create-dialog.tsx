import { useState } from 'react';
import { toast } from 'sonner';

import { User } from '@brainbox/client/types';
import { generateId, IdType, NodeRole } from '@brainbox/core';
import { ChannelForm } from '@brainbox/ui/components/channels/channel-form';
import { NodeCollaboratorRoleDropdown } from '@brainbox/ui/components/collaborators/node-collaborator-role-dropdown';
import { NodeCollaboratorSearch } from '@brainbox/ui/components/collaborators/node-collaborator-search';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@brainbox/ui/components/ui/dialog';
import { Label } from '@brainbox/ui/components/ui/label';
import { Separator } from '@brainbox/ui/components/ui/separator';
import { useLayout } from '@brainbox/ui/contexts/layout';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

interface ChannelCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChannelCreateDialog = ({
  open,
  onOpenChange,
}: ChannelCreateDialogProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const { mutate, isPending } = useMutation();
  
  // State for collaborators
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [defaultRole, setDefaultRole] = useState<NodeRole>('editor');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create channel</DialogTitle>
          <DialogDescription>
            Create a new channel to collaborate with your peers
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <ChannelForm
            id={generateId(IdType.Channel)}
            values={{
              name: '',
            }}
            isPending={isPending}
            submitText="Create"
            handleCancel={() => {
              setCollaborators([]);
              setDefaultRole('editor');
              onOpenChange(false);
            }}
          handleSubmit={(values) => {
            if (isPending) {
              return;
            }

            // Build collaborators object - creator is always admin, others get the selected role
            const channelCollaborators: Record<string, NodeRole> = {
              [workspace.userId]: 'admin',
            };
            
            // Add invited collaborators
            collaborators.forEach((user) => {
              channelCollaborators[user.id] = defaultRole;
            });

            mutate({
              input: {
                type: 'channel.create',
                name: values.name,
                avatar: values.avatar,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
              },
              onSuccess(output) {
                // Clear state first to prevent any potential loops
                const collaboratorsToAdd = [...collaborators];
                setCollaborators([]);
                setDefaultRole('editor');
                onOpenChange(false);
                
                // Add collaborators after channel creation if there are any
                if (collaboratorsToAdd.length > 0) {
                  mutate({
                    input: {
                      type: 'node.collaborator.create',
                      nodeId: output.id,
                      collaboratorIds: collaboratorsToAdd.map((user) => user.id),
                      role: defaultRole,
                      accountId: workspace.accountId,
                      workspaceId: workspace.id,
                    },
                    onSuccess() {
                      // Open the channel only after both mutations complete successfully
                      layout.openLeft(output.id);
                    },
                    onError(error) {
                      toast.error(`Channel created but failed to add collaborators: ${error.message}`);
                      // Still open the channel even if collaborator addition fails
                      layout.openLeft(output.id);
                    },
                  });
                } else {
                  // No collaborators to add, open the channel immediately
                  layout.openLeft(output.id);
                }
              },
              onError(error) {
                toast.error(error.message);
              },
            });
          }}
        />
        
        {/* Collaborators Section */}
        <div className="space-y-3">
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-medium">Invite Collaborators (Optional)</Label>
            <NodeCollaboratorSearch
              value={collaborators}
              onChange={setCollaborators}
              excluded={[workspace.userId]} // Exclude current user as they're automatically added as admin
            />
            {collaborators.length > 0 && (
              <div className="flex items-center gap-2">
                <Label className="text-xs">Default role:</Label>
                <NodeCollaboratorRoleDropdown
                  value={defaultRole}
                  onChange={setDefaultRole}
                  canEdit={true}
                />
              </div>
            )}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
