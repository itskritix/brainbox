import { WorkspaceMetadata } from '@brainbox/client/types/workspaces';

export type WorkspaceMetadataListQueryInput = {
  type: 'workspace.metadata.list';
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'workspace.metadata.list': {
      input: WorkspaceMetadataListQueryInput;
      output: WorkspaceMetadata[];
    };
  }
}
