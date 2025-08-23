import { AccountMetadata } from '@brainbox/client/types/accounts';

export type AccountMetadataListQueryInput = {
  type: 'account.metadata.list';
  accountId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'account.metadata.list': {
      input: AccountMetadataListQueryInput;
      output: AccountMetadata[];
    };
  }
}
