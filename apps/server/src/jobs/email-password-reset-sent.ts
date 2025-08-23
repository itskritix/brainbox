import { JobHandler } from '@brainbox/server/jobs';
import { sendEmailPasswordResetEmail } from '@brainbox/server/lib/accounts';

export type EmailPasswordResetSendInput = {
  type: 'email.password.reset.send';
  otpId: string;
};

declare module '@brainbox/server/jobs' {
  interface JobMap {
    'email.password.reset.send': {
      input: EmailPasswordResetSendInput;
    };
  }
}

export const emailPasswordResetSendHandler: JobHandler<
  EmailPasswordResetSendInput
> = async (input) => {
  const { otpId } = input;
  await sendEmailPasswordResetEmail(otpId);
};
