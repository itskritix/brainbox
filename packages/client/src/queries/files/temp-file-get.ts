import { TempFile } from '@brainbox/client/types';

export type TempFileGetQueryInput = {
  type: 'temp.file.get';
  id: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'temp.file.get': {
      input: TempFileGetQueryInput;
      output: TempFile | null;
    };
  }
}
