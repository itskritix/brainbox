import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

export const usePinnedItems = () => {
  const workspace = useWorkspace();
  const { mutate } = useMutation();
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const metadataQuery = useLiveQuery({
    type: 'workspace.metadata.list',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  const pinnedItems = useMemo(() => {
    const pinnedItemsMetadata = metadataQuery.data?.find(
      (metadata) => metadata.key === 'pinned.items'
    );
    const value = pinnedItemsMetadata?.value;
    
    // Validate the structure and provide safe defaults
    return {
      pinnedChats: Array.isArray(value?.pinnedChats) ? value.pinnedChats : [],
      pinnedChannels: Array.isArray(value?.pinnedChannels) ? value.pinnedChannels : [],
    };
  }, [metadataQuery.data]);

  const updatePinnedItems = useCallback((newPinnedItems: typeof pinnedItems, itemId: string) => {
    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set loading state
    setLoadingItems(prev => new Set([...prev, itemId]));

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      mutate({
        input: {
          type: 'workspace.metadata.update',
          accountId: workspace.accountId,
          workspaceId: workspace.id,
          key: 'pinned.items',
          value: newPinnedItems,
        },
        onSuccess: () => {
          setLoadingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
        },
        onError: (error) => {
          console.error('Failed to update pinned items:', error);
          toast.error('Failed to update pinned items. Please try again.');
          setLoadingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
        },
      });
    }, 300); // 300ms debounce
  }, [workspace.accountId, workspace.id, mutate]);

  const toggleChatPin = useCallback((chatId: string) => {
    const currentPinnedChats = pinnedItems.pinnedChats;
    const isPinned = currentPinnedChats.includes(chatId);
    
    const newPinnedChats = isPinned
      ? currentPinnedChats.filter(id => id !== chatId)
      : [...currentPinnedChats, chatId];

    updatePinnedItems({
      ...pinnedItems,
      pinnedChats: newPinnedChats,
    }, chatId);
  }, [pinnedItems, updatePinnedItems]);

  const toggleChannelPin = useCallback((channelId: string) => {
    const currentPinnedChannels = pinnedItems.pinnedChannels;
    const isPinned = currentPinnedChannels.includes(channelId);
    
    const newPinnedChannels = isPinned
      ? currentPinnedChannels.filter(id => id !== channelId)
      : [...currentPinnedChannels, channelId];

    updatePinnedItems({
      ...pinnedItems,
      pinnedChannels: newPinnedChannels,
    }, channelId);
  }, [pinnedItems, updatePinnedItems]);

  const isChatPinned = (chatId: string) => {
    return pinnedItems.pinnedChats.includes(chatId);
  };

  const isChannelPinned = (channelId: string) => {
    return pinnedItems.pinnedChannels.includes(channelId);
  };

  // Cleanup effect to clear timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    pinnedItems,
    toggleChatPin,
    toggleChannelPin,
    isChatPinned,
    isChannelPinned,
    isLoading: metadataQuery.isPending,
    isItemLoading: (itemId: string) => loadingItems.has(itemId),
  };
};