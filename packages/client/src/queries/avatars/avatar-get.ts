import { Avatar } from '@brainbox/client/types/avatars';

export type AvatarGetQueryInput = {
  type: 'avatar.get';
  accountId: string;
  avatarId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'avatar.get': {
      input: AvatarGetQueryInput;
      output: Avatar | null;
    };
  }
}
