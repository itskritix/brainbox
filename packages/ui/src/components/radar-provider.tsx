import { getIdType, IdType } from '@brainbox/core';
import { RadarContext } from '@brainbox/ui/contexts/radar';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface RadarProviderProps {
  children: React.ReactNode;
}

export const RadarProvider = ({ children }: RadarProviderProps) => {
  const radarDataQuery = useLiveQuery({
    type: 'radar.data.get',
  });

  const radarData = radarDataQuery.data ?? {};
  return (
    <RadarContext.Provider
      value={{
        getAccountState: (accountId) => {
          const accountState = radarData[accountId];
          if (!accountState) {
            return {
              hasUnread: false,
              unreadCount: 0,
            };
          }

          const hasUnread = Object.values(accountState).some(
            (state) => state.state.hasUnread
          );

          const unreadCount = Object.values(accountState).reduce(
            (acc, state) => acc + state.state.unreadCount,
            0
          );

          return {
            hasUnread,
            unreadCount,
          };
        },
        getWorkspaceState: (accountId, workspaceId) => {
          const workspaceState = radarData[accountId]?.[workspaceId];
          if (workspaceState) {
            return workspaceState;
          }

          return {
            userId: '',
            workspaceId: workspaceId,
            accountId: accountId,
            state: {
              hasUnread: false,
              unreadCount: 0,
            },
            nodeStates: {},
          };
        },
        getNodeState: (accountId, workspaceId, nodeId) => {
          const workspaceState = radarData[accountId]?.[workspaceId];
          if (workspaceState) {
            const nodeState = workspaceState.nodeStates[nodeId];
            if (nodeState) {
              return nodeState;
            }
          }

          return {
            hasUnread: false,
            unreadCount: 0,
          };
        },
        getChatsState: (accountId, workspaceId) => {
          const workspaceState = radarData[accountId]?.[workspaceId];
          if (!workspaceState) {
            return {
              hasUnread: false,
              unreadCount: 0,
            };
          }

          const chatStates = Object.entries(workspaceState.nodeStates)
            .filter(([id]) => getIdType(id) === IdType.Chat)
            .map(([_, nodeState]) => nodeState);

          const hasUnread = chatStates.some((state) => state.hasUnread);
          const unreadCount = chatStates.reduce((acc, state) => {
            return acc + state.unreadCount;
          }, 0);

          return {
            hasUnread,
            unreadCount,
          };
        },
        getChannelsState: (accountId, workspaceId) => {
          const workspaceState = radarData[accountId]?.[workspaceId];
          if (!workspaceState) {
            return {
              hasUnread: false,
              unreadCount: 0,
            };
          }

          const channelStates = Object.entries(workspaceState.nodeStates)
            .filter(([id]) => getIdType(id) === IdType.Channel)
            .map(([_, nodeState]) => nodeState);

          const hasUnread = channelStates.some((state) => state.hasUnread);
          const unreadCount = channelStates.reduce((acc, state) => {
            return acc + state.unreadCount;
          }, 0);

          return {
            hasUnread,
            unreadCount,
          };
        },
        markNodeAsSeen: (accountId, workspaceId, nodeId) => {
          window.brainbox.executeMutation({
            type: 'node.interaction.seen',
            nodeId,
            accountId,
            workspaceId,
          });
        },
        markNodeAsOpened: (accountId, workspaceId, nodeId) => {
          window.brainbox.executeMutation({
            type: 'node.interaction.opened',
            nodeId,
            accountId,
            workspaceId,
          });
        },
      }}
    >
      {children}
    </RadarContext.Provider>
  );
};
