import { Settings, UserPlus, Plus } from 'lucide-react';
import { useState } from 'react';

import { SpecialContainerTabPath } from '@brainbox/client/types';
import { SpaceSidebarItem } from '@brainbox/ui/components/spaces/space-sidebar-item';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { SidebarMenuHeader } from '@brainbox/ui/components/layouts/sidebars/sidebar-menu-header';
import { useLayout } from '@brainbox/ui/contexts/layout';
import { SpaceCreateDialog } from '@brainbox/ui/components/spaces/space-create-dialog';

export const SidebarSpaces = () => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const canCreateSpace =
    workspace.role !== 'guest' && workspace.role !== 'none';

  const spaceListQuery = useLiveQuery({
    type: 'space.list',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    parentId: workspace.id,
    page: 0,
    count: 100,
  });

  const spaces = spaceListQuery.data ?? [];

  return (
    <div className="flex flex-col group/sidebar h-full px-2">
      <div className="flex items-center justify-between h-10 px-0 border-b app-drag-region">
        <SidebarMenuHeader />
      </div>
      <div className="p-2 border-b border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => setCreateSpaceOpen(true)}
            className="flex items-center justify-center flex-1 h-8 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex w-full min-w-0 flex-col gap-1 overflow-auto">
        {spaces.map((space) => (
          <SpaceSidebarItem space={space} key={space.id} />
        ))}
      </div>
      <div className="border-t mt-2 pt-2 space-y-1">
        <button
          onClick={() => layout.open(SpecialContainerTabPath.AllSettings)}
          className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => layout.open(SpecialContainerTabPath.WorkspaceUsers)}
          className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <UserPlus className="size-4" />
          <span>Invite Member</span>
        </button>
      </div>
      <SpaceCreateDialog open={createSpaceOpen} onOpenChange={setCreateSpaceOpen} />
    </div>
  );
};
