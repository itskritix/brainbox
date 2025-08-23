import { AccountMutationHandlerBase } from '@brainbox/client/handlers/mutations/accounts/base';
import { parseApiError } from '@brainbox/client/lib/ky';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import { EmailVerifyMutationInput } from '@brainbox/client/mutations/accounts/email-verify';
import { AppService } from '@brainbox/client/services/app-service';
import { EmailVerifyInput, LoginOutput } from '@brainbox/core';

export class EmailVerifyMutationHandler
  extends AccountMutationHandlerBase
  implements MutationHandler<EmailVerifyMutationInput>
{
  constructor(appService: AppService) {
    super(appService);
  }

  async handleMutation(input: EmailVerifyMutationInput): Promise<LoginOutput> {
    const server = this.app.getServer(input.server);

    if (!server) {
      throw new MutationError(
        MutationErrorCode.ServerNotFound,
        `Server ${input.server} was not found! Try using a different server.`
      );
    }

    try {
      const body: EmailVerifyInput = {
        id: input.id,
        otp: input.otp,
      };

      const response = await this.app.client
        .post(`${server.httpBaseUrl}/v1/accounts/emails/verify`, {
          json: body,
        })
        .json<LoginOutput>();

      if (response.type === 'verify') {
        throw new MutationError(
          MutationErrorCode.EmailVerificationFailed,
          'Email verification failed! Please try again.'
        );
      }

      await this.handleLoginSuccess(response, server);

      return response;
    } catch (error) {
      const apiError = await parseApiError(error);
      throw new MutationError(MutationErrorCode.ApiError, apiError.message);
    }
  }
}
