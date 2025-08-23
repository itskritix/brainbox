import { useState } from 'react';

import { AvatarFallback } from '@brainbox/ui/components/avatars/avatar-fallback';
import { useAccount } from '@brainbox/ui/contexts/account';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { AvatarProps, getAvatarSizeClasses } from '@brainbox/ui/lib/avatars';
import { cn } from '@brainbox/ui/lib/utils';

export const AvatarImage = (props: AvatarProps) => {
  const account = useAccount();
  const [failed, setFailed] = useState(false);

  const avatarQuery = useLiveQuery({
    type: 'avatar.get',
    accountId: account.id,
    avatarId: props.avatar!,
  });

  if (avatarQuery.isPending) {
    return (
      <div
        className={cn(
          getAvatarSizeClasses(props.size),
          'object-cover rounded bg-gray-200',
          props.className
        )}
      />
    );
  }

  const avatar = avatarQuery.data;
  if (!avatar || failed) {
    return <AvatarFallback {...props} />;
  }

  return (
    <img
      src={avatar.url}
      className={cn(
        getAvatarSizeClasses(props.size),
        'object-cover rounded',
        props.className
      )}
      alt={'Custom Avatar'}
      onError={() => setFailed(true)}
    />
  );
};
