import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@colanode/ui/components/avatars/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@colanode/ui/components/ui/dropdown-menu';
import { UnreadBadge } from '@colanode/ui/components/ui/unread-badge';
import { useAccount } from '@colanode/ui/contexts/account';
import { useRadar } from '@colanode/ui/contexts/radar';
import { useWorkspace } from '@colanode/ui/contexts/workspace';
import { useLiveQuery } from '@colanode/ui/hooks/use-live-query';

export const SidebarMenuHeader = () => {
  const workspace = useWorkspace();
  const account = useAccount();
  const radar = useRadar();

  const [open, setOpen] = useState(false);
  const workspaceListQuery = useLiveQuery({
    type: 'workspace.list',
    accountId: account.id,
  });

  const workspaces = workspaceListQuery.data ?? [];
  const otherWorkspaces = workspaces.filter((w) => w.id !== workspace.id);
  const otherWorkspaceStates = otherWorkspaces.map((w) =>
    radar.getWorkspaceState(w.accountId, w.id)
  );
  const unreadCount = otherWorkspaceStates.reduce(
    (acc, curr) => acc + curr.state.unreadCount,
    0
  );
  const hasUnread = otherWorkspaceStates.some((w) => w.state.hasUnread);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="text-sm font-medium text-gray-900 leading-7">
          <Avatar
            id={workspace.id}
            name={workspace.name}
            avatar={workspace.avatar}
            size="small"
          />
          <span className='ml-1'>
            {workspace.name}
         </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-80 rounded-lg"
        align="start"
        side="right"
        sideOffset={4}
      >
        <DropdownMenuLabel className="mb-1">Workspaces</DropdownMenuLabel>
        {workspaces.map((workspaceItem) => {
          const workspaceUnreadState = radar.getWorkspaceState(
            workspaceItem.accountId,
            workspaceItem.id
          );
          return (
            <DropdownMenuItem
              key={workspaceItem.id}
              className="p-0 cursor-pointer"
              onClick={() => {
                account.openWorkspace(workspaceItem.id);
              }}
            >
              <div className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <Avatar
                  id={workspaceItem.id}
                  name={workspaceItem.name}
                  avatar={workspaceItem.avatar}
                  size="small"
                />
                <p className="flex-1 text-left text-sm font-normal text-gray-900 leading-7 truncate">
                  {workspaceItem.name}
                </p>
                {workspaceItem.id === workspace.id ? (
                  <Check className="size-4" />
                ) : (
                  <UnreadBadge
                    count={workspaceUnreadState.state.unreadCount}
                    unread={workspaceUnreadState.state.hasUnread}
                  />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          className="gap-2 p-2 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => {
            account.openWorkspaceCreate();
          }}
        >
          <Plus className="size-4" />
          <p className="font-medium">Create workspace</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
