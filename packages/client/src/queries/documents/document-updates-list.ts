import { DocumentUpdate } from '@brainbox/client/types/documents';

export type DocumentUpdatesListQueryInput = {
  type: 'document.updates.list';
  documentId: string;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'document.updates.list': {
      input: DocumentUpdatesListQueryInput;
      output: DocumentUpdate[];
    };
  }
}
