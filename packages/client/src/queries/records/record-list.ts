import { LocalRecordNode } from '@brainbox/client/types/nodes';
import {
  DatabaseViewFilterAttributes,
  DatabaseViewSortAttributes,
} from '@brainbox/core';

export type RecordListQueryInput = {
  type: 'record.list';
  databaseId: string;
  filters: DatabaseViewFilterAttributes[];
  sorts: DatabaseViewSortAttributes[];
  page: number;
  count: number;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'record.list': {
      input: RecordListQueryInput;
      output: LocalRecordNode[];
    };
  }
}
