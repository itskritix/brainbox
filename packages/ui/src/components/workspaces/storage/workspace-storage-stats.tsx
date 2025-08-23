import { BadgeAlert, ServerCog } from 'lucide-react';
import { match } from 'ts-pattern';

import { Separator } from '@brainbox/ui/components/ui/separator';
import { Spinner } from '@brainbox/ui/components/ui/spinner';
import { StorageStats } from '@brainbox/ui/components/workspaces/storage/storage-stats';
import { WorkspaceStorageUserTable } from '@brainbox/ui/components/workspaces/storage/workspace-storage-user-table';
import { useServer } from '@brainbox/ui/contexts/server';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useQuery } from '@brainbox/ui/hooks/use-query';

export const WorkspaceStorageStats = () => {
  const workspace = useWorkspace();
  const server = useServer();
  const isFeatureSupported = server.supports('workspace.storage.management');

  const workspaceStorageGetQuery = useQuery(
    {
      type: 'workspace.storage.get',
      accountId: workspace.accountId,
      workspaceId: workspace.id,
    },
    {
      enabled: isFeatureSupported,
    }
  );

  const data = workspaceStorageGetQuery.data ?? {
    storageLimit: '0',
    storageUsed: '0',
    subtypes: [],
    users: [],
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Workspace storage
        </h2>
        <Separator className="mt-3" />
      </div>
      {!isFeatureSupported ? (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <ServerCog className="size-8 text-muted-foreground" />
          <span>
            Workspace storage management is not supported by this server
            version. Please contact your administrator to upgrade the server.
          </span>
        </div>
      ) : (
        match(workspaceStorageGetQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Spinner className="size-5" />
              <span>Loading storage data from the server...</span>
            </div>
          ))
          .with({ isPending: false, isError: false }, () => (
            <>
              <StorageStats
                storageUsed={data.storageUsed}
                storageLimit={data.storageLimit ?? null}
                subtypes={data.subtypes}
              />
              <WorkspaceStorageUserTable
                users={data.users}
                onUpdate={() => {
                  workspaceStorageGetQuery.refetch();
                }}
              />
            </>
          ))
          .otherwise(() => (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <BadgeAlert className="size-8 text-red-400" />
              <span>
                Couldn't load storage information from the server. Please make
                sure that the server is accessible and you have permission to
                access this workspace storage data.
              </span>
            </div>
          ))
      )}
    </div>
  );
};
