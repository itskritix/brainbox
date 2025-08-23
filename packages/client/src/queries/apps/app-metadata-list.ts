import { AppMetadata } from '@brainbox/client/types/apps';

export type AppMetadataListQueryInput = {
  type: 'app.metadata.list';
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'app.metadata.list': {
      input: AppMetadataListQueryInput;
      output: AppMetadata[];
    };
  }
}
