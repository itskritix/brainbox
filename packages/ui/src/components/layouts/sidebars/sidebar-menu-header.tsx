import { Check, ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@brainbox/ui/components/ui/dropdown-menu';
import { UnreadBadge } from '@brainbox/ui/components/ui/unread-badge';
import { useAccount } from '@brainbox/ui/contexts/account';
import { useRadar } from '@brainbox/ui/contexts/radar';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

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
        <button className="flex items-center gap-2 w-full p-1 rounded-md hover:bg-gray-50 transition-colors group">
          <Avatar
            id={workspace.id}
            name={workspace.name}
            avatar={workspace.avatar}
            size="small"
          />
          <span className="flex-1 text-sm font-medium text-gray-900 truncate text-left">
            {workspace.name}
          </span>
          {hasUnread && <div className="size-1.5 bg-blue-500 rounded-full" />}
          <svg className={`size-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-lg border shadow-lg"
        align="start"
        side="right"
        sideOffset={4}
      >
        {workspaces.map((workspaceItem) => {
          const workspaceUnreadState = radar.getWorkspaceState(
            workspaceItem.accountId,
            workspaceItem.id
          );
          return (
            <DropdownMenuItem
              key={workspaceItem.id}
              className="cursor-pointer p-2 focus:bg-gray-50"
              onClick={() => {
                account.openWorkspace(workspaceItem.id);
              }}
            >
              <Avatar
                id={workspaceItem.id}
                name={workspaceItem.name}
                avatar={workspaceItem.avatar}
                size="small"
              />
              <span className="flex-1 text-sm font-medium truncate">
                {workspaceItem.name}
              </span>
              {workspaceItem.id === workspace.id ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <UnreadBadge
                  count={workspaceUnreadState.state.unreadCount}
                  unread={workspaceUnreadState.state.hasUnread}
                />
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem
          className="cursor-pointer p-2 text-gray-600 hover:text-gray-900 focus:bg-gray-50 border-t mt-1"
          onClick={() => {
            account.openWorkspaceCreate();
          }}
        >
          <Plus className="size-4" />
          <span className="font-medium">Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
