import { DocumentState } from '@brainbox/client/types/documents';

export type DocumentStateGetQueryInput = {
  type: 'document.state.get';
  documentId: string;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'document.state.get': {
      input: DocumentStateGetQueryInput;
      output: DocumentState | null;
    };
  }
}
