import { User } from '@brainbox/client/types/users';

export type UserGetQueryInput = {
  type: 'user.get';
  userId: string;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'user.get': {
      input: UserGetQueryInput;
      output: User | null;
    };
  }
}
