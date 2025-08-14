import { Copy, Image, LetterText, Settings, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';

import { LocalPageNode } from '@colanode/client/types';
import { NodeRole, hasNodeRole } from '@colanode/core';
import { NodeCollaboratorAudit } from '@colanode/ui/components/collaborators/node-collaborator-audit';
import { PageDeleteDialog } from '@colanode/ui/components/pages/page-delete-dialog';
import { PageUpdateDialog } from '@colanode/ui/components/pages/page-update-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@colanode/ui/components/ui/dropdown-menu';

interface PageSettingsProps {
  page: LocalPageNode;
  role: NodeRole;
}

export const PageSettings = ({ page, role }: PageSettingsProps) => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteModal] = useState(false);

  const canEdit = hasNodeRole(role, 'editor');
  const canDelete = hasNodeRole(role, 'editor');

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1 rounded hover:bg-gray-100 transition-colors">
            <Settings className="size-4 text-gray-500 hover:text-gray-700" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="w-72 rounded-lg border shadow-lg">
          <div className="px-3 py-2 border-b">
            <p className="text-sm font-medium text-gray-900 truncate">
              {page.attributes.name}
            </p>
          </div>
          <div className="p-1">
            <DropdownMenuItem
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                canEdit ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (!canEdit) return;
                setShowUpdateDialog(true);
              }}
              disabled={!canEdit}
            >
              <LetterText className="size-4 text-gray-600" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                canEdit ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                setShowUpdateDialog(true);
              }}
            >
              <Image className="size-4 text-gray-600" />
              <span>Update icon</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm opacity-50 cursor-not-allowed"
              disabled
            >
              <Copy className="size-4 text-gray-600" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                canDelete ? 'cursor-pointer hover:bg-red-50 text-red-700' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (!canDelete) return;
                setShowDeleteModal(true);
              }}
              disabled={!canDelete}
            >
              <Trash2 className={`size-4 ${canDelete ? 'text-red-600' : 'text-gray-600'}`} />
              <span>Delete</span>
            </DropdownMenuItem>
          </div>
          <div className="border-t pt-2">
            <div className="px-3 pb-1">
              <p className="text-xs font-medium text-gray-500">Created by</p>
            </div>
            <div className="px-3 pb-2">
              <NodeCollaboratorAudit
                collaboratorId={page.createdBy}
                date={page.createdAt}
              />
            </div>
            {page.updatedBy && page.updatedAt && (
              <>
                <div className="px-3 pb-1">
                  <p className="text-xs font-medium text-gray-500">Last updated by</p>
                </div>
                <div className="px-3 pb-2">
                  <NodeCollaboratorAudit
                    collaboratorId={page.updatedBy}
                    date={page.updatedAt}
                  />
                </div>
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <PageDeleteDialog
        pageId={page.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteModal}
      />
      <PageUpdateDialog
        page={page}
        role={role}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
      />
    </Fragment>
  );
};
