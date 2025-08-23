import { SidebarMenuType } from '@brainbox/client/types';
import { SidebarChats } from '@brainbox/ui/components/layouts/sidebars/sidebar-chats';
import { SidebarMenu } from '@brainbox/ui/components/layouts/sidebars/sidebar-menu';
import { SidebarSettings } from '@brainbox/ui/components/layouts/sidebars/sidebar-settings';
import { SidebarSpaces } from '@brainbox/ui/components/layouts/sidebars/sidebar-spaces';

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
