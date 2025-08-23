import { ServerDetails } from '@brainbox/client/types/servers';

export type ServerListQueryInput = {
  type: 'server.list';
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'server.list': {
      input: ServerListQueryInput;
      output: ServerDetails[];
    };
  }
}
