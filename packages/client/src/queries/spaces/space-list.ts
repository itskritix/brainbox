import { LocalSpaceNode } from '@brainbox/client/types/nodes';

export type SpaceListQueryInput = {
  type: 'space.list';
  page: number;
  count: number;
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'space.list': {
      input: SpaceListQueryInput;
      output: LocalSpaceNode[];
    };
  }
}
