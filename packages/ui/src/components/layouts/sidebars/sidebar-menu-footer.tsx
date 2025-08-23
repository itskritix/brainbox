import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

import { UnreadState } from '@brainbox/client/types';
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
import { AccountContext, useAccount } from '@brainbox/ui/contexts/account';
import { useApp } from '@brainbox/ui/contexts/app';
import { useRadar } from '@brainbox/ui/contexts/radar';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

export function SidebarMenuFooter() {
  const app = useApp();
  const account = useAccount();
  const radar = useRadar();
  const [open, setOpen] = useState(false);

  const accountListQuery = useLiveQuery({
    type: 'account.list',
  });

  const accounts = accountListQuery.data ?? [];
  const otherAccounts = accounts.filter((a) => a.id !== account.id);
  const accountUnreadStates: Record<string, UnreadState> = {};
  for (const accountItem of otherAccounts) {
    accountUnreadStates[accountItem.id] = radar.getAccountState(accountItem.id);
  }

  const hasUnread = Object.values(accountUnreadStates).some(
    (state) => state.hasUnread
  );

  const unreadCount = Object.values(accountUnreadStates).reduce(
    (acc, curr) => acc + curr.unreadCount,
    0
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center justify-center relative mb-2 cursor-pointer outline-none">
          <Avatar
            id={account.id}
            name={account.name}
            avatar={account.avatar}
            className="size-10 rounded-lg shadow-md"
          />
          <UnreadBadge
            count={unreadCount}
            unread={hasUnread}
            className="absolute -top-1 right-0"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-80 rounded-lg"
        side="right"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="mb-1">Accounts</DropdownMenuLabel>
        {accounts.map((accountItem) => {
          const state = accountUnreadStates[accountItem.id] ?? {
            unreadCount: 0,
            hasUnread: false,
          };

          return (
            <DropdownMenuItem
              key={accountItem.id}
              className="p-0"
              onClick={() => {
                app.openAccount(accountItem.id);
              }}
            >
              <AccountContext.Provider
                value={{
                  ...accountItem,
                  openWorkspace: () => {},
                  openWorkspaceCreate: () => {},
                }}
              >
                <div className="w-full flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar
                    className="h-8 w-8 rounded-lg"
                    id={accountItem.id}
                    name={accountItem.name}
                    avatar={accountItem.avatar}
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {accountItem.name}
                    </span>
                    <span className="truncate text-xs">
                      {accountItem.email}
                    </span>
                  </div>
                  {accountItem.id === account.id ? (
                    <Check className="size-4" />
                  ) : (
                    <UnreadBadge
                      count={state.unreadCount}
                      unread={state.hasUnread}
                    />
                  )}
                </div>
              </AccountContext.Provider>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            app.openLogin();
          }}
        >
          <Plus className="size-4" />
          <p className="font-medium">Add account</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
