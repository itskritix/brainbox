import { Copy, Image, LetterText, Settings, Trash2, UserRoundPlus } from 'lucide-react';
import { Fragment, useState } from 'react';

import { LocalChannelNode } from '@colanode/client/types';
import { NodeRole, hasNodeRole } from '@colanode/core';
import { ChannelDeleteDialog } from '@colanode/ui/components/channels/channel-delete-dialog';
import { ChannelUpdateDialog } from '@colanode/ui/components/channels/channel-update-dialog';
import { NodeCollaboratorAudit } from '@colanode/ui/components/collaborators/node-collaborator-audit';
import { NodeCollaborators } from '@colanode/ui/components/collaborators/node-collaborators';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@colanode/ui/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@colanode/ui/components/ui/dialog';
import { useWorkspace } from '@colanode/ui/contexts/workspace';
import { useLiveQuery } from '@colanode/ui/hooks/use-live-query';

interface ChannelSettingsProps {
  channel: LocalChannelNode;
  role: NodeRole;
}

export const ChannelSettings = ({ channel, role }: ChannelSettingsProps) => {
  const workspace = useWorkspace();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteModal] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);

  const canEdit = hasNodeRole(role, 'editor');
  const canDelete = hasNodeRole(role, 'editor');
  const canManageCollaborators = hasNodeRole(role, 'admin');

  // Get the node tree for collaborator management
  const nodeTreeQuery = useLiveQuery({
    type: 'node.tree.get',
    nodeId: channel.id,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  const nodes = nodeTreeQuery.data ?? [];

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Settings className="size-4 cursor-pointer text-muted-foreground hover:text-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="mr-2 w-80">
          <DropdownMenuLabel>{channel.attributes.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (!canEdit) {
                return;
              }

              setShowUpdateDialog(true);
            }}
            disabled={!canEdit}
          >
            <LetterText className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) {
                return;
              }

              setShowUpdateDialog(true);
            }}
          >
            <Image className="size-4" />
            Update icon
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            disabled
          >
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              // Small delay to ensure dropdown closes before dialog opens
              setTimeout(() => setShowCollaborators(true), 100);
            }}
            disabled={!canManageCollaborators}
          >
            <UserRoundPlus className="size-4" />
            Manage Collaborators
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => {
              if (!canDelete) {
                return;
              }

              setShowDeleteModal(true);
            }}
            disabled={!canDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Created by</DropdownMenuLabel>
          <DropdownMenuItem>
            <NodeCollaboratorAudit
              collaboratorId={channel.createdBy}
              date={channel.createdAt}
            />
          </DropdownMenuItem>
          {channel.updatedBy && channel.updatedAt && (
            <Fragment>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Last updated by</DropdownMenuLabel>
              <DropdownMenuItem>
                <NodeCollaboratorAudit
                  collaboratorId={channel.updatedBy}
                  date={channel.updatedAt}
                />
              </DropdownMenuItem>
            </Fragment>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ChannelDeleteDialog
        channelId={channel.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteModal}
      />
      <ChannelUpdateDialog
        channel={channel}
        role={role}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
      />
      
      {/* Collaborators Dialog */}
      <Dialog open={showCollaborators} onOpenChange={setShowCollaborators}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Channel Collaborators</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <NodeCollaborators 
              node={channel} 
              nodes={nodes} 
              role={role} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
