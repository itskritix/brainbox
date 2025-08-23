import { LocalSpaceNode } from '@brainbox/client/types';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { AvatarPopover } from '@brainbox/ui/components/avatars/avatar-popover';
import { Button } from '@brainbox/ui/components/ui/button';

interface SpaceAvatarProps {
  space: LocalSpaceNode;
  readonly: boolean;
  onUpdate: (avatar: string) => void;
}

export const SpaceAvatar = ({
  space,
  readonly,
  onUpdate,
}: SpaceAvatarProps) => {
  if (readonly) {
    return (
      <Button type="button" variant="outline" size="icon">
        <Avatar
          id={space.id}
          name={space.attributes.name}
          avatar={space.attributes.avatar}
          className="h-6 w-6"
        />
      </Button>
    );
  }

  return (
    <AvatarPopover
      onPick={(avatar) => {
        if (avatar === space.attributes.avatar) return;

        onUpdate(avatar);
      }}
    >
      <Button type="button" variant="outline" size="icon">
        <Avatar
          id={space.id}
          name={space.attributes.name}
          avatar={space.attributes.avatar}
          className="h-6 w-6"
        />
      </Button>
    </AvatarPopover>
  );
};
