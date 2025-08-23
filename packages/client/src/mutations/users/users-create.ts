import {
  UserCreateErrorOutput,
  UserCreateInput,
  UserOutput,
} from '@brainbox/core';

export type UsersCreateMutationInput = {
  type: 'users.create';
  workspaceId: string;
  accountId: string;
  users: UserCreateInput[];
};

export type UsersCreateMutationOutput = {
  users: UserOutput[];
  errors: UserCreateErrorOutput[];
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'users.create': {
      input: UsersCreateMutationInput;
      output: UsersCreateMutationOutput;
    };
  }
}
