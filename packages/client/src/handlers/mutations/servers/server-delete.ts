import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  ServerDeleteMutationInput,
  ServerDeleteMutationOutput,
} from '@brainbox/client/mutations/servers/server-delete';
import { AppService } from '@brainbox/client/services/app-service';
import { isColanodeServer } from '@brainbox/core';

export class ServerDeleteMutationHandler
  implements MutationHandler<ServerDeleteMutationInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  async handleMutation(
    input: ServerDeleteMutationInput
  ): Promise<ServerDeleteMutationOutput> {
    if (isColanodeServer(input.domain)) {
      throw new MutationError(
        MutationErrorCode.ServerDeleteForbidden,
        'Cannot delete Brainbox server'
      );
    }

    await this.app.deleteServer(input.domain);

    return {
      success: true,
    };
  }
}
