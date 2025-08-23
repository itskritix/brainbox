import { Container, ContainerBody } from '@brainbox/ui/components/ui/container';
import { UserStorageStats } from '@brainbox/ui/components/workspaces/storage/user-storage-stats';
import { WorkspaceStorageStats } from '@brainbox/ui/components/workspaces/storage/workspace-storage-stats';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';

export const WorkspaceStorage = () => {
  const workspace = useWorkspace();
  const canManageStorage =
    workspace.role === 'owner' || workspace.role === 'admin';

  return (
    <Container>
      <ContainerBody className="max-w-4xl space-y-10">
        <UserStorageStats />
        {canManageStorage && <WorkspaceStorageStats />}
      </ContainerBody>
    </Container>
  );
};
