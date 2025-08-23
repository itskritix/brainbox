import { LocalFileNode } from '@brainbox/client/types/nodes';

export type FileListQueryInput = {
  type: 'file.list';
  parentId: string;
  page: number;
  count: number;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'file.list': {
      input: FileListQueryInput;
      output: LocalFileNode[];
    };
  }
}
