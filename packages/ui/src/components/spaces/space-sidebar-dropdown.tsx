import {
  Database,
  Ellipsis,
  Folder,
  Plus,
  Settings,
  StickyNote,
} from 'lucide-react';
import { Fragment, useState } from 'react';

import { LocalSpaceNode } from '@colanode/client/types';
import { DatabaseCreateDialog } from '@colanode/ui/components/databases/database-create-dialog';
import { FolderCreateDialog } from '@colanode/ui/components/folders/folder-create-dialog';
import { PageCreateDialog } from '@colanode/ui/components/pages/page-create-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@colanode/ui/components/ui/dropdown-menu';
import { useLayout } from '@colanode/ui/contexts/layout';

interface SpaceSidebarDropdownProps {
  space: LocalSpaceNode;
}

export const SpaceSidebarDropdown = ({ space }: SpaceSidebarDropdownProps) => {
  const layout = useLayout();

  const [openCreatePage, setOpenCreatePage] = useState(false);
  const [openCreateDatabase, setOpenCreateDatabase] = useState(false);
  const [openCreateFolder, setOpenCreateFolder] = useState(false);

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="opacity-0 group-hover/sidebar-space:opacity-100 flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-all focus-visible:outline-none cursor-pointer">
            <Ellipsis className="size-3 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-lg border shadow-lg">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-gray-900 truncate">
              {space.attributes.name ?? 'Unnamed'}
            </p>
          </div>
          <div className="border-t">
            <DropdownMenuItem
              onSelect={() => setOpenCreatePage(true)}
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50"
            >
              <StickyNote className="size-4 text-gray-600" />
              <span className="text-sm">Add page</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setOpenCreateDatabase(true)}
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50"
            >
              <Database className="size-4 text-gray-600" />
              <span className="text-sm">Add database</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setOpenCreateFolder(true)}
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50"
            >
              <Folder className="size-4 text-gray-600" />
              <span className="text-sm">Add folder</span>
            </DropdownMenuItem>
          </div>
          <div className="border-t">
            <DropdownMenuItem
              onClick={() => layout.previewLeft(space.id)}
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50"
            >
              <Settings className="size-4 text-gray-600" />
              <span className="text-sm">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => layout.previewLeft(space.id)}
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50"
            >
              <Plus className="size-4 text-gray-600" />
              <span className="text-sm">Add collaborators</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {openCreatePage && (
        <PageCreateDialog
          spaceId={space.id}
          open={openCreatePage}
          onOpenChange={setOpenCreatePage}
        />
      )}
      {openCreateDatabase && (
        <DatabaseCreateDialog
          spaceId={space.id}
          open={openCreateDatabase}
          onOpenChange={setOpenCreateDatabase}
        />
      )}
      {openCreateFolder && (
        <FolderCreateDialog
          spaceId={space.id}
          open={openCreateFolder}
          onOpenChange={setOpenCreateFolder}
        />
      )}
    </Fragment>
  );
};
