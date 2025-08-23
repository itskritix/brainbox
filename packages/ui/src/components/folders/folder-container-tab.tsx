import { LocalFolderNode } from '@brainbox/client/types';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface FolderContainerTabProps {
  folderId: string;
}

export const FolderContainerTab = ({ folderId }: FolderContainerTabProps) => {
  const workspace = useWorkspace();

  const nodeGetQuery = useLiveQuery({
    type: 'node.get',
    nodeId: folderId,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (nodeGetQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const folder = nodeGetQuery.data as LocalFolderNode;
  if (!folder) {
    return <p className="text-sm text-muted-foreground">Not found</p>;
  }

  const name =
    folder.attributes.name && folder.attributes.name.length > 0
      ? folder.attributes.name
      : 'Unnamed';

  return (
    <div className="flex items-center space-x-2">
      <Avatar
        size="small"
        id={folder.id}
        name={name}
        avatar={folder.attributes.avatar}
      />
      <span>{name}</span>
    </div>
  );
};
