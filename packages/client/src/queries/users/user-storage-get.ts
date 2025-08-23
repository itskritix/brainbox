import { FileSubtype } from '@brainbox/core';

export type UserStorageGetQueryInput = {
  type: 'user.storage.get';
  accountId: string;
  workspaceId: string;
};

export type UserStorageGetQueryOutput = {
  storageLimit: string;
  storageUsed: string;
  subtypes: {
    subtype: FileSubtype;
    storageUsed: string;
  }[];
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'user.storage.get': {
      input: UserStorageGetQueryInput;
      output: UserStorageGetQueryOutput;
    };
  }
}
