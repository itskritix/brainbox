import { AccountMutationHandlerBase } from '@brainbox/client/handlers/mutations/accounts/base';
import { parseApiError } from '@brainbox/client/lib/ky';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  EmailPasswordResetInitMutationInput,
  EmailPasswordResetInitMutationOutput,
} from '@brainbox/client/mutations/accounts/email-password-reset-init';
import { AppService } from '@brainbox/client/services/app-service';
import {
  EmailPasswordResetInitInput,
  EmailPasswordResetInitOutput,
} from '@brainbox/core';

export class EmailPasswordResetInitMutationHandler
  extends AccountMutationHandlerBase
  implements MutationHandler<EmailPasswordResetInitMutationInput>
{
  constructor(appService: AppService) {
    super(appService);
  }

  async handleMutation(
    input: EmailPasswordResetInitMutationInput
  ): Promise<EmailPasswordResetInitMutationOutput> {
    const server = this.app.getServer(input.server);

    if (!server) {
      throw new MutationError(
        MutationErrorCode.ServerNotFound,
        `Server ${input.server} was not found! Try using a different server.`
      );
    }

    try {
      const body: EmailPasswordResetInitInput = {
        email: input.email,
      };

      const response = await this.app.client
        .post(`${server.httpBaseUrl}/v1/accounts/emails/passwords/reset/init`, {
          json: body,
        })
        .json<EmailPasswordResetInitOutput>();

      return response;
    } catch (error) {
      const apiError = await parseApiError(error);
      throw new MutationError(MutationErrorCode.ApiError, apiError.message);
    }
  }
}
