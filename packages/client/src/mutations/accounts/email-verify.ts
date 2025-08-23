import { LoginOutput } from '@brainbox/core';

export type EmailVerifyMutationInput = {
  type: 'email.verify';
  server: string;
  id: string;
  otp: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'email.verify': {
      input: EmailVerifyMutationInput;
      output: LoginOutput;
    };
  }
}
