import { Pin, PinOff, Loader2 } from 'lucide-react';
import { InView } from 'react-intersection-observer';

import { LocalChannelNode } from '@brainbox/client/types';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { UnreadBadge } from '@brainbox/ui/components/ui/unread-badge';
import { useLayout } from '@brainbox/ui/contexts/layout';
import { useRadar } from '@brainbox/ui/contexts/radar';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { usePinnedItems } from '@brainbox/ui/hooks/use-pinned-items';
import { cn } from '@brainbox/ui/lib/utils';

interface ChannelSidebarItemProps {
  channel: LocalChannelNode;
}

export const ChannelSidebarItem = ({ channel }: ChannelSidebarItemProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const radar = useRadar();
  const { isChannelPinned, toggleChannelPin, isItemLoading } = usePinnedItems();

  const isActive = layout.activeTab === channel.id;
  const unreadState = radar.getNodeState(
    workspace.accountId,
    workspace.id,
    channel.id
  );
  const isPinned = isChannelPinned(channel.id);
  const isLoading = isItemLoading(channel.id);

  return (
    <InView
      rootMargin="20px"
      onChange={(inView) => {
        if (inView) {
          radar.markNodeAsSeen(workspace.accountId, workspace.id, channel.id);
        }
      }}
      className={cn(
        'flex w-full items-center cursor-pointer group',
        isActive && 'bg-sidebar-accent'
      )}
    >
      <Avatar
        id={channel.id}
        avatar={channel.attributes.avatar}
        name={channel.attributes.name}
        className="h-4 w-4"
      />
      <span
        className={cn(
          'line-clamp-1 w-full flex-grow pl-2 text-left',
          !isActive && unreadState.hasUnread && 'font-semibold'
        )}
      >
        {channel.attributes.name ?? 'Unnamed'}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoading) {
              toggleChannelPin(channel.id);
            }
          }}
          disabled={isLoading}
          className={cn(
            "opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 rounded transition-opacity",
            isLoading && "cursor-not-allowed opacity-50"
          )}
          title={isLoading ? 'Updating...' : (isPinned ? 'Unpin channel' : 'Pin channel')}
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
