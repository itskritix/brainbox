import { Hash, MessageCircle, Plus, User } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

import { ChannelCreateDialog } from '@colanode/ui/components/channels/channel-create-dialog';
import { ChannelSidebarItem } from '@colanode/ui/components/channels/channel-sidebar-item';
import { ChatCreatePopover } from '@colanode/ui/components/chats/chat-create-popover';
import { ChatSidebarItem } from '@colanode/ui/components/chats/chat-sidebar-item';
import { Avatar } from '@colanode/ui/components/avatars/avatar';
import { useAccount } from '@colanode/ui/contexts/account';
import { useLayout } from '@colanode/ui/contexts/layout';
import { useRadar } from '@colanode/ui/contexts/radar';
import { useWorkspace } from '@colanode/ui/contexts/workspace';
import { useLiveQuery } from '@colanode/ui/hooks/use-live-query';
import { useMutation } from '@colanode/ui/hooks/use-mutation';
import { cn } from '@colanode/ui/lib/utils';

export const RightSidebar = () => {
  const [activePanel, setActivePanel] = useState<'channels' | 'chats' | null>(null);
  const [showChannelCreateDialog, setShowChannelCreateDialog] = useState(false);
  const workspace = useWorkspace();
  const account = useAccount();
  const layout = useLayout();
  const radar = useRadar();
  const { mutate } = useMutation();

  // Get spaces first
  const spaceListQuery = useLiveQuery({
    type: 'space.list',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    parentId: workspace.id,
    page: 0,
    count: 100,
  });

  const spaces = spaceListQuery.data ?? [];

  // Get channels from the first space only (to avoid conditional hooks)
  const channelsQuery = useLiveQuery({
    type: 'node.children.get',
    nodeId: spaces.length > 0 ? spaces[0].id : workspace.id,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    types: ['channel'],
  });

  const channels = channelsQuery.data ?? [];

  // Get chats
  const chatListQuery = useLiveQuery({
    type: 'chat.list',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    page: 0,
    count: 100,
  });

  const chats = chatListQuery.data ?? [];

  // Find self-chat
  const selfChat = useMemo(() => {
    return chats.find(chat => {
      const collaborators = Object.keys(chat.attributes.collaborators);
      // Self chat: exactly one collaborator and it's the current user
      return collaborators.length === 1 && collaborators[0] === workspace.userId;
    });
  }, [chats, workspace.userId]);

  // Other chats (excluding self-chat)
  const otherChats = useMemo(() => {
    return chats.filter(chat => {
      const collaborators = Object.keys(chat.attributes.collaborators);
      // Filter out self-chats - exclude chats with exactly one collaborator who is the current user
      return !(collaborators.length === 1 && collaborators[0] === workspace.userId);
    });
  }, [chats, workspace.userId]);

  // Create self-chat for user if it doesn't exist (covers existing users)
  useEffect(() => {
    // Only try to create if query has loaded and we haven't found a self-chat
    if (!chatListQuery.isLoading && !selfChat) {
      mutate({
        input: {
          type: 'chat.create',
          accountId: workspace.accountId,
          workspaceId: workspace.id,
          userId: workspace.userId,
        },
        onError(error) {
          console.error('Failed to create self-chat:', error.message);
        },
      });
    }
  }, [chatListQuery.isLoading, selfChat, workspace, mutate]);


  const handleIconClick = (panel: 'channels' | 'chats') => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };

  return (
    <div className="flex h-full">
      {/* Content Panel - LEFT of icon bar */}
      {activePanel && (
        <div className="w-72 bg-white border-l border-gray-200">
          {activePanel === 'channels' && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="size-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-900">Channels</h3>
                </div>
                <button
                  onClick={() => setShowChannelCreateDialog(true)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  title="Create Channel"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Channels List */}
              <div className="flex-1 overflow-y-auto p-1">
                {channels.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Hash className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No channels yet</p>
                    <button
                      onClick={() => setShowChannelCreateDialog(true)}
                      className="text-blue-600 hover:text-blue-700 text-xs mt-1"
                    >
                      Create your first channel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {channels.map((channel) => (
                      <button
                        key={channel.id}
                        className={cn(
                          'w-full p-2 text-left rounded-md hover:bg-gray-50 transition-colors',
                          layout.activeTab === channel.id && 'bg-blue-50 border border-blue-200'
                        )}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            layout.openLeft(channel.id);
                          } else {
                            layout.open(channel.id);
                          }
                        }}
                        onDoubleClick={() => layout.open(channel.id)}
                      >
                        <ChannelSidebarItem channel={channel} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activePanel === 'chats' && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-900">Direct Messages</h3>
                </div>
                <button
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  title="Start Conversation"
                >
                  <ChatCreatePopover />
                </button>
              </div>

              {/* Chats List */}
              <div className="flex-1 overflow-y-auto p-1">
                <div className="space-y-0.5">
                  {/* Self-chat (always pinned at top) */}
                  <div>
                    <button
                      className={cn(
                        'w-full p-2 text-left rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100 mb-1',
                        selfChat && layout.activeTab === selfChat.id && 'bg-blue-50 border border-blue-200'
                      )}
                      onClick={(e) => {
                        if (selfChat) {
                          if (e.ctrlKey || e.metaKey) {
                            layout.openLeft(selfChat.id);
                          } else {
                            layout.open(selfChat.id);
                          }
                        } else {
                          // Create self-chat immediately when clicked if it doesn't exist
                          mutate({
                            input: {
                              type: 'chat.create',
                              accountId: workspace.accountId,
                              workspaceId: workspace.id,
                              userId: workspace.userId,
                            },
                            onSuccess(result) {
                              layout.open(result.id);
                            },
                            onError(error) {
                              console.error('Failed to create self-chat on click:', error.message);
                            },
                          });
                        }
                      }}
                    >
                      <Avatar
                        id={account.id}
                        avatar={account.avatar}
                        name={account.name}
                        className="h-6 w-6"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-gray-900 text-xs">
                          {account.name}
                        </span>
                        <span className="text-xs text-gray-500">Personal notes</span>
                      </div>
                      {selfChat && (() => {
                        const unreadState = radar.getNodeState(
                          workspace.accountId,
                          workspace.id,
                          selfChat.id
                        );
                        return unreadState.hasUnread ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : null;
                      })()}
                    </button>
                  </div>

                  {/* Other chats */}
                  {otherChats.length === 0 ? (
                    selfChat ? null : (
                      <div className="text-center py-4 text-gray-500">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No conversations yet</p>
                      </div>
                    )
                  ) : (
                    otherChats.map((chat) => (
                      <button
                        key={chat.id}
                        className={cn(
                          'w-full p-2 text-left rounded-md hover:bg-gray-50 transition-colors',
                          layout.activeTab === chat.id && 'bg-blue-50 border border-blue-200'
                        )}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            layout.openLeft(chat.id);
                          } else {
                            layout.open(chat.id);
                          }
                        }}
                        onDoubleClick={() => layout.open(chat.id)}
                      >
                        <ChatSidebarItem chat={chat} />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Icon Bar - RIGHT side */}
      <div className="w-10 bg-gray-100 border-l border-gray-200 flex flex-col items-center py-2 gap-2">
        <button
          onClick={() => handleIconClick('channels')}
          className={cn(
            'p-1.5 rounded-md transition-colors hover:bg-gray-200',
            activePanel === 'channels' ? 'bg-gray-900 text-white' : 'text-gray-600'
          )}
          title="Channels"
        >
          <Hash className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => handleIconClick('chats')}
          className={cn(
            'p-1.5 rounded-md transition-colors hover:bg-gray-200',
            activePanel === 'chats' ? 'bg-gray-900 text-white' : 'text-gray-600'
          )}
          title="Direct Messages"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>

      {/* Channel Create Dialog */}
      {showChannelCreateDialog && spaces.length > 0 && (
        <ChannelCreateDialog
          spaceId={spaces[0].id}
          open={showChannelCreateDialog}
          onOpenChange={setShowChannelCreateDialog}
        />
      )}
    </div>
  );
};