import { useMemo } from 'react';

import { useWorkspace } from '@colanode/ui/contexts/workspace';
import { useLiveQuery } from '@colanode/ui/hooks/use-live-query';
import { useMutation } from '@colanode/ui/hooks/use-mutation';

export const usePinnedItems = () => {
  const workspace = useWorkspace();
  const { mutate } = useMutation();

  const metadataQuery = useLiveQuery({
    type: 'workspace.metadata.list',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  const pinnedItems = useMemo(() => {
    const pinnedItemsMetadata = metadataQuery.data?.find(
      (metadata) => metadata.key === 'pinned.items'
    );
    return pinnedItemsMetadata?.value || {
      pinnedChats: [],
      pinnedChannels: [],
    };
  }, [metadataQuery.data]);

  const toggleChatPin = (chatId: string) => {
    const currentPinnedChats = pinnedItems.pinnedChats;
    const isPinned = currentPinnedChats.includes(chatId);
    
    const newPinnedChats = isPinned
      ? currentPinnedChats.filter(id => id !== chatId)
      : [...currentPinnedChats, chatId];

    mutate({
      input: {
        type: 'workspace.metadata.update',
        accountId: workspace.accountId,
        workspaceId: workspace.id,
        key: 'pinned.items',
        value: {
          ...pinnedItems,
          pinnedChats: newPinnedChats,
        },
      },
    });
  };

  const toggleChannelPin = (channelId: string) => {
    const currentPinnedChannels = pinnedItems.pinnedChannels;
    const isPinned = currentPinnedChannels.includes(channelId);
    
    const newPinnedChannels = isPinned
      ? currentPinnedChannels.filter(id => id !== channelId)
      : [...currentPinnedChannels, channelId];

    mutate({
      input: {
        type: 'workspace.metadata.update',
        accountId: workspace.accountId,
        workspaceId: workspace.id,
        key: 'pinned.items',
        value: {
          ...pinnedItems,
          pinnedChannels: newPinnedChannels,
        },
      },
    });
  };

  const isChatPinned = (chatId: string) => {
    return pinnedItems.pinnedChats.includes(chatId);
  };

  const isChannelPinned = (channelId: string) => {
    return pinnedItems.pinnedChannels.includes(channelId);
  };

  return {
    pinnedItems,
    toggleChatPin,
    toggleChannelPin,
    isChatPinned,
    isChannelPinned,
    isLoading: metadataQuery.isPending,
  };
};