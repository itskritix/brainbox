import { Account } from '@brainbox/client/types/accounts';

export type AccountListQueryInput = {
  type: 'account.list';
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'account.list': {
      input: AccountListQueryInput;
      output: Account[];
    };
  }
}
