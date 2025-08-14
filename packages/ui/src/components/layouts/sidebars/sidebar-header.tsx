import { SidebarMenuHeader } from '@colanode/ui/components/layouts/sidebars/sidebar-menu-header';
interface SidebarHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export const SidebarHeader = ({ title, actions }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between h-12 px-0 border-b app-drag-region">
      <div>
        <SidebarMenuHeader />
      </div>
      {actions && (
        <div className="text-muted-foreground opacity-0 transition-opacity group-hover/sidebar:opacity-100 flex items-center justify-center app-no-drag-region">
          {actions}
        </div>
      )}
    </div>
  );
};
