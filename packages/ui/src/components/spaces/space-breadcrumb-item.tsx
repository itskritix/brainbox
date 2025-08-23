import { LocalSpaceNode } from '@brainbox/client/types';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';

interface SpaceBreadcrumbItemProps {
  space: LocalSpaceNode;
}

export const SpaceBreadcrumbItem = ({ space }: SpaceBreadcrumbItemProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Avatar
        id={space.id}
        name={space.attributes.name}
        avatar={space.attributes.avatar}
        className="size-4"
      />
      <span>{space.attributes.name}</span>
    </div>
  );
};
