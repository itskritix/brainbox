import { LocalDatabaseViewNode } from '@brainbox/client/types/nodes';

export type DatabaseViewListQueryInput = {
  type: 'database.view.list';
  accountId: string;
  workspaceId: string;
  databaseId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'database.view.list': {
      input: DatabaseViewListQueryInput;
      output: LocalDatabaseViewNode[];
    };
  }
}
