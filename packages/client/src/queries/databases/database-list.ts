import { LocalDatabaseNode } from '@brainbox/client/types/nodes';

export type DatabaseListQueryInput = {
  type: 'database.list';
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'database.list': {
      input: DatabaseListQueryInput;
      output: LocalDatabaseNode[];
    };
  }
}
