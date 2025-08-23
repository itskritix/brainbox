import { WorkspaceStorageGetOutput } from '@brainbox/core';

export type WorkspaceStorageGetQueryInput = {
  type: 'workspace.storage.get';
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'workspace.storage.get': {
      input: WorkspaceStorageGetQueryInput;
      output: WorkspaceStorageGetOutput;
    };
  }
}
