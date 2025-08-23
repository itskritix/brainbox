import { JobHandler } from '@brainbox/server/jobs';
import { sendEmailVerifyEmail } from '@brainbox/server/lib/accounts';

export type EmailVerifySendInput = {
  type: 'email.verify.send';
  otpId: string;
};

declare module '@brainbox/server/jobs' {
  interface JobMap {
    'email.verify.send': {
      input: EmailVerifySendInput;
    };
  }
}

export const emailVerifySendHandler: JobHandler<EmailVerifySendInput> = async (
  input
) => {
  const { otpId } = input;
  await sendEmailVerifyEmail(otpId);
};
