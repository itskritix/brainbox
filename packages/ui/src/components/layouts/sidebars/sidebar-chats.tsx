import { ChatCreatePopover } from '@brainbox/ui/components/chats/chat-create-popover';
import { ChatSidebarItem } from '@brainbox/ui/components/chats/chat-sidebar-item';
import { useLayout } from '@brainbox/ui/contexts/layout';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { cn } from '@brainbox/ui/lib/utils';

export const SidebarChats = () => {
  const workspace = useWorkspace();
  const layout = useLayout();

  const chatListQuery = useLiveQuery({
    type: 'chat.list',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    page: 0,
    count: 100,
  });

  const chats = chatListQuery.data ?? [];

  return (
    <div className="flex flex-col group/sidebar h-full px-2">
      <div className="flex items-center justify-between h-10 px-2 mb-2">
        <span className="text-sm font-medium text-gray-700">Chats</span>
        <ChatCreatePopover />
      </div>
      <div className="flex w-full min-w-0 flex-col gap-1">
        {chats.map((item) => (
          <button
            key={item.id}
            className={cn(
              'px-2 flex w-full items-center gap-2 overflow-hidden rounded-md text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-7 cursor-pointer',
              layout.activeTab === item.id &&
                'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            )}
            onClick={() => {
              layout.preview(item.id);
            }}
            onDoubleClick={() => {
              layout.open(item.id);
            }}
          >
            <ChatSidebarItem chat={item} />
          </button>
        ))}
      </div>
    </div>
  );
};
