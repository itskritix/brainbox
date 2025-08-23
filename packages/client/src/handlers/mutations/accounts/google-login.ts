import { AccountMutationHandlerBase } from '@brainbox/client/handlers/mutations/accounts/base';
import { parseApiError } from '@brainbox/client/lib/ky';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  GoogleLoginMutationInput,
  MutationError,
  MutationErrorCode,
} from '@brainbox/client/mutations';
import { AppService } from '@brainbox/client/services/app-service';
import { GoogleLoginInput, LoginOutput } from '@brainbox/core';

export class GoogleLoginMutationHandler
  extends AccountMutationHandlerBase
  implements MutationHandler<GoogleLoginMutationInput>
{
  constructor(appService: AppService) {
    super(appService);
  }

  async handleMutation(input: GoogleLoginMutationInput): Promise<LoginOutput> {
    const server = this.app.getServer(input.server);

    if (!server) {
      throw new MutationError(
        MutationErrorCode.ServerNotFound,
        `Server ${input.server} was not found! Try using a different server.`
      );
    }

    try {
      const body: GoogleLoginInput = {
        code: input.code,
      };

      const response = await this.app.client
        .post(`${server.httpBaseUrl}/v1/accounts/google/login`, {
          json: body,
        })
        .json<LoginOutput>();

      if (response.type === 'verify') {
        return response;
      }

      await this.handleLoginSuccess(response, server);

      return response;
    } catch (error) {
      const apiError = await parseApiError(error);
      throw new MutationError(MutationErrorCode.ApiError, apiError.message);
    }
  }
}
