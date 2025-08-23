import { LoginOutput } from '@brainbox/core';

export type EmailRegisterMutationInput = {
  type: 'email.register';
  server: string;
  name: string;
  email: string;
  password: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'email.register': {
      input: EmailRegisterMutationInput;
      output: LoginOutput;
    };
  }
}
