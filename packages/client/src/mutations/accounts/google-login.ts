import { LoginOutput } from '@brainbox/core';

export type GoogleLoginMutationInput = {
  type: 'google.login';
  server: string;
  code: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'google.login': {
      input: GoogleLoginMutationInput;
      output: LoginOutput;
    };
  }
}
