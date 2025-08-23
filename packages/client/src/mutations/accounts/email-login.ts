import { LoginOutput } from '@brainbox/core';

export type EmailLoginMutationInput = {
  type: 'email.login';
  server: string;
  email: string;
  password: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'email.login': {
      input: EmailLoginMutationInput;
      output: LoginOutput;
    };
  }
}
