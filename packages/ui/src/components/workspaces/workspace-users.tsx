import { useState } from 'react';
import { InView } from 'react-intersection-observer';

import { UserListQueryInput } from '@brainbox/client/queries';
import { WorkspaceRole } from '@brainbox/core';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { Container } from '@brainbox/ui/components/ui/container';
import { Separator } from '@brainbox/ui/components/ui/separator';
import { Spinner } from '@brainbox/ui/components/ui/spinner';
import { WorkspaceUserInvite } from '@brainbox/ui/components/workspaces/workspace-user-invite';
import { WorkspaceUserRoleDropdown } from '@brainbox/ui/components/workspaces/workspace-user-role-dropdown';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQueries } from '@brainbox/ui/hooks/use-live-queries';

const USERS_PER_PAGE = 50;

export const WorkspaceUsers = () => {
  const workspace = useWorkspace();
  const canEditUsers = workspace.role === 'owner' || workspace.role === 'admin';
  const [lastPage, setLastPage] = useState<number>(1);

  const inputs: UserListQueryInput[] = Array.from({
    length: lastPage,
  }).map((_, i) => ({
    type: 'user.list',
    page: i + 1,
    count: USERS_PER_PAGE,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  }));

  const result = useLiveQueries(inputs);
  const users = result.flatMap((data) => data.data ?? []);
  const isPending = result.some((data) => data.isPending);
  const hasMore = !isPending && users.length === lastPage * USERS_PER_PAGE;

  return (
    <Container>
      <div className="h-full overflow-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-8">
        {canEditUsers && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Invite</h2>
              <Separator className="mt-3" />
            </div>
            <WorkspaceUserInvite workspace={workspace} />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
            <p className="text-sm text-muted-foreground mt-1">
              The list of all users on the workspace
            </p>
            <Separator className="mt-3" />
          </div>
          <div className="flex flex-col gap-3">
            {users.map((user) => {
              const name: string = user.name ?? 'Unknown';
              const email: string = user.email ?? ' ';
              const avatar: string | null | undefined = user.avatar;
              const role: WorkspaceRole = user.role;

              if (!role) {
                return null;
              }

              return (
                <div key={user.id} className="flex items-center space-x-3">
                  <Avatar id={user.id} name={name} avatar={avatar} />
                  <div className="flex-grow">
                    <p className="text-sm font-medium leading-none">{name}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                  <WorkspaceUserRoleDropdown
                    userId={user.id}
                    value={role}
                    canEdit={canEditUsers}
                  />
                </div>
              );
            })}
            <div className="flex items-center justify-center space-x-3">
              {isPending && <Spinner />}
            </div>
            <InView
              rootMargin="200px"
              onChange={(inView) => {
                if (inView && hasMore && !isPending) {
                  setLastPage(lastPage + 1);
                }
              }}
            />
          </div>
        </div>
        </div>
      </div>
    </Container>
  );
};
