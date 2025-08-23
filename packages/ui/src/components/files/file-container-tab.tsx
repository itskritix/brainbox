import { LocalFileNode } from '@brainbox/client/types';
import { FileThumbnail } from '@brainbox/ui/components/files/file-thumbnail';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface FileContainerTabProps {
  fileId: string;
}

export const FileContainerTab = ({ fileId }: FileContainerTabProps) => {
  const workspace = useWorkspace();

  const nodeGetQuery = useLiveQuery({
    type: 'node.get',
    nodeId: fileId,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (nodeGetQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const file = nodeGetQuery.data as LocalFileNode;
  if (!file) {
    return <p className="text-sm text-muted-foreground">Not found</p>;
  }

  return (
    <div className="flex items-center space-x-2">
      <FileThumbnail file={file} className="size-4 rounded object-contain" />
      <span>{file.attributes.name}</span>
    </div>
  );
};
