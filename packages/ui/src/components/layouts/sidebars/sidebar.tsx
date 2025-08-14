import { SidebarMenuType } from '@colanode/client/types';
import { SidebarChats } from '@colanode/ui/components/layouts/sidebars/sidebar-chats';
import { SidebarMenu } from '@colanode/ui/components/layouts/sidebars/sidebar-menu';
import { SidebarSettings } from '@colanode/ui/components/layouts/sidebars/sidebar-settings';
import { SidebarSpaces } from '@colanode/ui/components/layouts/sidebars/sidebar-spaces';

interface SidebarProps {
  menu: SidebarMenuType;
  onMenuChange: (menu: SidebarMenuType) => void;
}

export const Sidebar = ({ menu, onMenuChange }: SidebarProps) => {
  return (
    <div className="flex h-screen min-h-screen max-h-screen w-full min-w-full flex-row bg-slate-50">
      <div className="min-h-0 flex-grow overflow-auto">
       <SidebarSpaces />
      </div>
    </div>
  );
};
