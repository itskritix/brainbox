import { Workspace } from '@brainbox/client/types/workspaces';

export type WorkspaceListQueryInput = {
  type: 'workspace.list';
  accountId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'workspace.list': {
      input: WorkspaceListQueryInput;
      output: Workspace[];
    };
  }
}
