import { Copy, Image, LetterText, Settings, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';

import { LocalDatabaseNode } from '@colanode/client/types';
import { NodeRole, hasNodeRole } from '@colanode/core';
import { NodeCollaboratorAudit } from '@colanode/ui/components/collaborators/node-collaborator-audit';
import { DatabaseDeleteDialog } from '@colanode/ui/components/databases/database-delete-dialog';
import { DatabaseUpdateDialog } from '@colanode/ui/components/databases/database-update-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@colanode/ui/components/ui/dropdown-menu';

interface DatabaseSettingsProps {
  database: LocalDatabaseNode;
  role: NodeRole;
}

export const DatabaseSettings = ({ database, role }: DatabaseSettingsProps) => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteModal] = useState(false);

  const canEdit = hasNodeRole(role, 'editor');
  const canDelete = hasNodeRole(role, 'admin');

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Settings className="size-4 cursor-pointer text-muted-foreground hover:text-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="mr-2 w-64">
          <DropdownMenuLabel>{database.attributes.name}</DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              if (!canEdit) {
                return;
              }

              setShowUpdateDialog(true);
            }}
            disabled={!canEdit}
          >
            <LetterText />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) {
                return;
              }

              setShowUpdateDialog(true);
            }}
          >
            <Image />
            Update icon
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled
          >
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (!canDelete) {
                return;
              }

              setShowDeleteModal(true);
            }}
            disabled={!canDelete}
            variant="destructive"
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Created by</DropdownMenuLabel>
          <DropdownMenuItem>
            <NodeCollaboratorAudit
              collaboratorId={database.createdBy}
              date={database.createdAt}
            />
          </DropdownMenuItem>
          {database.updatedBy && database.updatedAt && (
            <Fragment>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Last updated by</DropdownMenuLabel>
              <DropdownMenuItem>
                <NodeCollaboratorAudit
                  collaboratorId={database.updatedBy}
                  date={database.updatedAt}
                />
              </DropdownMenuItem>
            </Fragment>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DatabaseDeleteDialog
        databaseId={database.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteModal}
      />
      <DatabaseUpdateDialog
        database={database}
        role={role}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
      />
    </Fragment>
  );
};
