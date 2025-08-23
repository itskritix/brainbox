import { User } from '@brainbox/client/types/users';

export type UserSearchQueryInput = {
  type: 'user.search';
  searchQuery: string;
  accountId: string;
  workspaceId: string;
  exclude?: string[];
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'user.search': {
      input: UserSearchQueryInput;
      output: User[];
    };
  }
}
