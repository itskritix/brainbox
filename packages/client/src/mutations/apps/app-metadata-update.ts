import { AppMetadataKey, AppMetadataMap } from '@brainbox/client/types/apps';

export type AppMetadataUpdateMutationInput = {
  type: 'app.metadata.update';
  key: AppMetadataKey;
  value: AppMetadataMap[AppMetadataKey]['value'];
};

export type AppMetadataUpdateMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'app.metadata.update': {
      input: AppMetadataUpdateMutationInput;
      output: AppMetadataUpdateMutationOutput;
    };
  }
}
