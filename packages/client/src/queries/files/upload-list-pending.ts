import { Upload } from '@brainbox/client/types/files';

export type UploadListPendingQueryInput = {
  type: 'upload.list.pending';
  accountId: string;
  workspaceId: string;
  page: number;
  count: number;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'upload.list.pending': {
      input: UploadListPendingQueryInput;
      output: Upload[];
    };
  }
}
