export type ServerDeleteMutationInput = {
  type: 'server.delete';
  domain: string;
};

export type ServerDeleteMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'server.delete': {
      input: ServerDeleteMutationInput;
      output: ServerDeleteMutationOutput;
    };
  }
}
