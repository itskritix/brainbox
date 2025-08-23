import { LocalMessageNode } from '@brainbox/client/types';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { cn } from '@brainbox/ui/lib/utils';

interface MessageAuthorNameProps {
  message: LocalMessageNode;
  className?: string;
}

export const MessageAuthorName = ({
  message,
  className,
}: MessageAuthorNameProps) => {
  const workspace = useWorkspace();

  const userGetQuery = useLiveQuery({
    type: 'user.get',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    userId: message.createdBy,
  });

  if (userGetQuery.isPending || !userGetQuery.data) {
    return null;
  }

  const user = userGetQuery.data;
  return <span className={cn('font-medium', className)}>{user.name}</span>;
};
