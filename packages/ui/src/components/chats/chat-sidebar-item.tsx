import { Pin, PinOff, Loader2 } from 'lucide-react';
import { InView } from 'react-intersection-observer';

import { LocalChatNode } from '@brainbox/client/types';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { UnreadBadge } from '@brainbox/ui/components/ui/unread-badge';
import { useLayout } from '@brainbox/ui/contexts/layout';
import { useRadar } from '@brainbox/ui/contexts/radar';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { usePinnedItems } from '@brainbox/ui/hooks/use-pinned-items';
import { cn } from '@brainbox/ui/lib/utils';

interface ChatSidebarItemProps {
  chat: LocalChatNode;
}

export const ChatSidebarItem = ({ chat }: ChatSidebarItemProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const radar = useRadar();
  const { isChatPinned, toggleChatPin, isItemLoading } = usePinnedItems();

  // Determine if this is a self-chat and get the appropriate user ID
  const collaborators = Object.keys(chat.attributes.collaborators);
  const isSelfChat = collaborators.length === 1 && collaborators[0] === workspace.userId;
  
  const userId = isSelfChat 
    ? workspace.userId // For self-chat, use current user
    : (collaborators.find((id) => id !== workspace.userId) ?? ''); // For regular chat, find the other user

  const userGetQuery = useLiveQuery({
    type: 'user.get',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    userId,
  });

  if (userGetQuery.isPending || !userGetQuery.data) {
    return null;
  }

  const user = userGetQuery.data;
  const unreadState = radar.getNodeState(
    workspace.accountId,
    workspace.id,
    chat.id
  );
  const isActive = layout.activeTab === chat.id;
  const isPinned = isChatPinned(chat.id);
  const isLoading = isItemLoading(chat.id);

  return (
    <InView
      rootMargin="20px"
      onChange={(inView) => {
        if (inView) {
          radar.markNodeAsSeen(workspace.accountId, workspace.id, chat.id);
        }
      }}
      className={cn(
        'flex w-full items-center cursor-pointer group',
        isActive && 'bg-sidebar-accent'
      )}
    >
      <Avatar
        id={user.id}
        avatar={user.avatar}
        name={user.name}
        className="h-5 w-5"
      />
      <span
        className={cn(
          'line-clamp-1 w-full flex-grow pl-2 text-left',
          !isActive && unreadState.hasUnread && 'font-semibold'
        )}
      >
        {isSelfChat ? `${user.name ?? 'Unnamed'} (me)` : (user.name ?? 'Unnamed')}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoading) {
              toggleChatPin(chat.id);
            }
          }}
          disabled={isLoading}
          className={cn(
            "opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 rounded transition-opacity",
            isLoading && "cursor-not-allowed opacity-50"
          )}
          title={isLoading ? 'Updating...' : (isPinned ? 'Unpin chat' : 'Pin chat')}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 text-gray-500 animate-spin" />
          ) : isPinned ? (
            <PinOff className="h-3 w-3 text-gray-500" />
          ) : (
            <Pin className="h-3 w-3 text-gray-500" />
          )}
        </button>
        {!isActive && (
          <UnreadBadge
            count={unreadState.unreadCount}
            unread={unreadState.hasUnread}
          />
        )}
      </div>
    </InView>
  );
};
