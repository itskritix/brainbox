import { LocalChatNode } from '@brainbox/client/types';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { UnreadBadge } from '@brainbox/ui/components/ui/unread-badge';
import { useRadar } from '@brainbox/ui/contexts/radar';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface ChatContainerTabProps {
  chatId: string;
  isActive: boolean;
}

export const ChatContainerTab = ({
  chatId,
  isActive,
}: ChatContainerTabProps) => {
  const workspace = useWorkspace();
  const radar = useRadar();

  const nodeGetQuery = useLiveQuery({
    type: 'node.get',
    nodeId: chatId,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  const chat = nodeGetQuery.data as LocalChatNode;
  
  // Determine if this is a self-chat and get the appropriate user ID
  const collaborators = chat ? Object.keys(chat.attributes.collaborators) : [];
  const isSelfChat = collaborators.length === 1 && collaborators[0] === workspace.userId;
  
  const userId = chat
    ? (isSelfChat 
        ? workspace.userId // For self-chat, use current user
        : (collaborators.find((id) => id !== workspace.userId) ?? '') // For regular chat, find the other user
      )
    : '';

  const userGetQuery = useLiveQuery({
    type: 'user.get',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    userId,
  });

  const user = userGetQuery.data;

  if (nodeGetQuery.isPending || userGetQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!chat || !user) {
    return <p className="text-sm text-muted-foreground">Not found</p>;
  }

  const unreadState = radar.getNodeState(
    workspace.accountId,
    workspace.id,
    chat.id
  );

  return (
    <div className="flex items-center space-x-2">
      <Avatar size="small" id={user.id} name={user.name} avatar={user.avatar} />
      <span>{isSelfChat ? `${user.name} (me)` : user.name}</span>
      {!isActive && (
        <UnreadBadge
          count={unreadState.unreadCount}
          unread={unreadState.hasUnread}
        />
      )}
    </div>
  );
};
