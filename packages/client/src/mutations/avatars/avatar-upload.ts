import { TempFile } from '@brainbox/client/types';

export type AvatarUploadMutationInput = {
  type: 'avatar.upload';
  accountId: string;
  file: TempFile;
};

export type AvatarUploadMutationOutput = {
  id: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'avatar.upload': {
      input: AvatarUploadMutationInput;
      output: AvatarUploadMutationOutput;
    };
  }
}
