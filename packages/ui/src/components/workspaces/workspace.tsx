import {
  WorkspaceMetadataKey,
  WorkspaceMetadataMap,
  Workspace as WorkspaceType,
} from '@brainbox/client/types';
import { Layout } from '@brainbox/ui/components/layouts/layout';
import { useAccount } from '@brainbox/ui/contexts/account';
import { WorkspaceContext } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface WorkspaceProps {
  workspace: WorkspaceType;
}

export const Workspace = ({ workspace }: WorkspaceProps) => {
  const account = useAccount();

  const workspaceMetadataListQuery = useLiveQuery({
    type: 'workspace.metadata.list',
    accountId: account.id,
    workspaceId: workspace.id,
  });

  if (workspaceMetadataListQuery.isPending) {
    return null;
  }

  return (
    <WorkspaceContext.Provider
      value={{
        ...workspace,
        getMetadata<K extends WorkspaceMetadataKey>(key: K) {
          const value = workspaceMetadataListQuery.data?.find(
            (m) => m.key === key
          );
          if (!value) {
            return undefined;
          }

          if (value.key !== key) {
            return undefined;
          }

          return value as WorkspaceMetadataMap[K];
        },
        setMetadata<K extends WorkspaceMetadataKey>(
          key: K,
          value: WorkspaceMetadataMap[K]['value']
        ) {
          window.brainbox.executeMutation({
            type: 'workspace.metadata.update',
            accountId: account.id,
            workspaceId: workspace.id,
            key,
            value,
          });
        },
        deleteMetadata(key: string) {
          window.brainbox.executeMutation({
            type: 'workspace.metadata.delete',
            accountId: account.id,
            workspaceId: workspace.id,
            key,
          });
        },
      }}
    >
      <Layout key={workspace.id} />
    </WorkspaceContext.Provider>
  );
};
