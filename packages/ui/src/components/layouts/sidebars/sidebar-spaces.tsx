import { Settings, UserPlus } from 'lucide-react';

import { SpecialContainerTabPath } from '@colanode/client/types';
import { SpaceSidebarItem } from '@colanode/ui/components/spaces/space-sidebar-item';
import { useWorkspace } from '@colanode/ui/contexts/workspace';
import { useLiveQuery } from '@colanode/ui/hooks/use-live-query';
import { SidebarMenuHeader } from '@colanode/ui/components/layouts/sidebars/sidebar-menu-header';
import { useLayout } from '@colanode/ui/contexts/layout';

export const SidebarSpaces = () => {
  const workspace = useWorkspace();
  const layout = useLayout();
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
    </div>
  );
};
