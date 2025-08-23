import { LocalMessageNode } from '@brainbox/client/types';
import { MessageAuthorAvatar } from '@brainbox/ui/components/messages/message-author-avatar';
import { MessageAuthorName } from '@brainbox/ui/components/messages/message-author-name';
import { MessageContent } from '@brainbox/ui/components/messages/message-content';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface MessageReferenceProps {
  messageId: string;
}

export const MessageReference = ({ messageId }: MessageReferenceProps) => {
  const workspace = useWorkspace();
  const nodeGetQuery = useLiveQuery({
    type: 'node.get',
    nodeId: messageId,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (nodeGetQuery.isPending) {
    return null;
  }

  const message = nodeGetQuery.data as LocalMessageNode;

  if (!message) {
    return (
      <div className="flex flex-row gap-2 border-l-4 p-2">
        <span className="text-sm text-muted-foreground">
          Message not found or has been deleted
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 border-l-4 p-2">
      <MessageAuthorAvatar message={message} className="size-5 mt-1" />
      <div className='"flex-grow flex-col gap-1'>
        <MessageAuthorName message={message} />
        <MessageContent message={message} />
      </div>
    </div>
  );
};
