import { Workspace } from '@brainbox/client/types/workspaces';

export type WorkspaceGetQueryInput = {
  type: 'workspace.get';
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'workspace.get': {
      input: WorkspaceGetQueryInput;
      output: Workspace | null;
    };
  }
}
