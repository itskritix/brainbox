import { useState } from 'react';

import { Account as AccountType } from '@brainbox/client/types';
import { Workspace } from '@brainbox/ui/components/workspaces/workspace';
import { WorkspaceCreate } from '@brainbox/ui/components/workspaces/workspace-create';
import { AccountContext } from '@brainbox/ui/contexts/account';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface AccountProps {
  account: AccountType;
}

export const Account = ({ account }: AccountProps) => {
  const [openCreateWorkspace, setOpenCreateWorkspace] = useState(false);

  const accountMetadataListQuery = useLiveQuery({
    type: 'account.metadata.list',
    accountId: account.id,
  });

  const workspaceListQuery = useLiveQuery({
    type: 'workspace.list',
    accountId: account.id,
  });

  if (accountMetadataListQuery.isPending || workspaceListQuery.isPending) {
    return null;
  }

  const workspaceMetadata = accountMetadataListQuery.data?.find(
    (metadata) => metadata.key === 'workspace'
  );

  const workspace =
    workspaceListQuery.data?.find(
      (workspace) => workspace.id === workspaceMetadata?.value
    ) || workspaceListQuery.data?.[0];

  const handleWorkspaceCreateSuccess = (id: string) => {
    setOpenCreateWorkspace(false);
    window.brainbox.executeMutation({
      type: 'account.metadata.update',
      accountId: account.id,
      key: 'workspace',
      value: id,
    });
  };

  const handleWorkspaceCreateCancel =
    (workspaceListQuery.data?.length || 0) > 0
      ? () => setOpenCreateWorkspace(false)
      : undefined;

  return (
    <AccountContext.Provider
      value={{
        ...account,
        openWorkspaceCreate: () => setOpenCreateWorkspace(true),
        openWorkspace: (id) => {
          setOpenCreateWorkspace(false);
          window.brainbox.executeMutation({
            type: 'account.metadata.update',
            accountId: account.id,
            key: 'workspace',
            value: id,
          });
        },
      }}
    >
      {!openCreateWorkspace && workspace ? (
        <Workspace workspace={workspace} />
      ) : (
        <WorkspaceCreate
          onSuccess={handleWorkspaceCreateSuccess}
          onCancel={handleWorkspaceCreateCancel}
        />
      )}
    </AccountContext.Provider>
  );
};
