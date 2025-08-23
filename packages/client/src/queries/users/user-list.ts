import { User } from '@brainbox/client/types/users';

export type UserListQueryInput = {
  type: 'user.list';
  accountId: string;
  workspaceId: string;
  page: number;
  count: number;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'user.list': {
      input: UserListQueryInput;
      output: User[];
    };
  }
}
