import { Server } from '@brainbox/client/types/servers';

export type ServerCreateMutationInput = {
  type: 'server.create';
  url: string;
};

export type ServerCreateMutationOutput = {
  server: Server;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'server.create': {
      input: ServerCreateMutationInput;
      output: ServerCreateMutationOutput;
    };
  }
}
