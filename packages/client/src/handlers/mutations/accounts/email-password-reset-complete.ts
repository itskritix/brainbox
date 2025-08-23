import { AccountMutationHandlerBase } from '@brainbox/client/handlers/mutations/accounts/base';
import { MutationHandler } from '@brainbox/client/lib';
import { parseApiError } from '@brainbox/client/lib/ky';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  EmailPasswordResetCompleteMutationInput,
  EmailPasswordResetCompleteMutationOutput,
} from '@brainbox/client/mutations/accounts/email-password-reset-complete';
import { AppService } from '@brainbox/client/services/app-service';
import {
  EmailPasswordResetCompleteInput,
  EmailPasswordResetCompleteOutput,
} from '@brainbox/core';

export class EmailPasswordResetCompleteMutationHandler
  extends AccountMutationHandlerBase
  implements MutationHandler<EmailPasswordResetCompleteMutationInput>
{
  constructor(appService: AppService) {
    super(appService);
  }

  async handleMutation(
    input: EmailPasswordResetCompleteMutationInput
  ): Promise<EmailPasswordResetCompleteMutationOutput> {
    const server = this.app.getServer(input.server);

    if (!server) {
      throw new MutationError(
        MutationErrorCode.ServerNotFound,
        `Server ${input.server} was not found! Try using a different server.`
      );
    }

    try {
      const body: EmailPasswordResetCompleteInput = {
        id: input.id,
        otp: input.otp,
        password: input.password,
      };

      const response = await this.app.client
        .post(
          `${server.httpBaseUrl}/v1/accounts/emails/passwords/reset/complete`,
          {
            json: body,
          }
        )
        .json<EmailPasswordResetCompleteOutput>();

      return response;
    } catch (error) {
      const apiError = await parseApiError(error);
      throw new MutationError(MutationErrorCode.ApiError, apiError.message);
    }
  }
}
