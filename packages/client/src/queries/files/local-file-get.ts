import { Download, LocalFile } from '@brainbox/client/types';

export type LocalFileGetQueryInput = {
  type: 'local.file.get';
  fileId: string;
  accountId: string;
  workspaceId: string;
  autoDownload?: boolean;
};

export type LocalFileGetQueryOutput = {
  localFile: LocalFile | null;
  download: Download | null;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'local.file.get': {
      input: LocalFileGetQueryInput;
      output: LocalFileGetQueryOutput;
    };
  }
}
