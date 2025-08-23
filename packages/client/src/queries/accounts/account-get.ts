import { Account } from '@brainbox/client/types/accounts';

export type AccountGetQueryInput = {
  type: 'account.get';
  accountId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'account.get': {
      input: AccountGetQueryInput;
      output: Account | null;
    };
  }
}
