import {
  UnreadBadge,
  UnreadBadgeProps,
} from '@brainbox/ui/components/ui/unread-badge';
import { cn } from '@brainbox/ui/lib/utils';

interface SidebarMenuIconProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  isActive?: boolean;
  unreadBadge?: UnreadBadgeProps;
  className?: string;
}

export const SidebarMenuIcon = ({
  icon: Icon,
  onClick,
  isActive = false,
  unreadBadge,
  className,
}: SidebarMenuIconProps) => {
  return (
    <div
      className={cn(
        'w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-200 rounded-md relative',
        className,
        isActive ? 'bg-gray-200' : ''
      )}
      onClick={onClick}
    >
      <Icon
        className={cn(
          'size-5',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}
      />
      {unreadBadge && (
        <UnreadBadge
          {...unreadBadge}
          className={cn('absolute top-0 right-0', unreadBadge.className)}
        />
      )}
    </div>
  );
};
