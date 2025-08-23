import { Upload } from '@brainbox/client/types/files';

export type UploadListQueryInput = {
  type: 'upload.list';
  accountId: string;
  workspaceId: string;
  page: number;
  count: number;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'upload.list': {
      input: UploadListQueryInput;
      output: Upload[];
    };
  }
}
