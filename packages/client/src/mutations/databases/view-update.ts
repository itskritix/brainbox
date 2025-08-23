import { DatabaseViewAttributes } from '@brainbox/core';

export type ViewUpdateMutationInput = {
  type: 'view.update';
  accountId: string;
  workspaceId: string;
  viewId: string;
  view: DatabaseViewAttributes;
};

export type ViewUpdateMutationOutput = {
  id: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'view.update': {
      input: ViewUpdateMutationInput;
      output: ViewUpdateMutationOutput;
    };
  }
}
