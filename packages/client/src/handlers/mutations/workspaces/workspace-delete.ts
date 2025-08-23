import { parseApiError } from '@brainbox/client/lib/ky';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  WorkspaceDeleteMutationInput,
  WorkspaceDeleteMutationOutput,
} from '@brainbox/client/mutations/workspaces/workspace-delete';
import { AppService } from '@brainbox/client/services/app-service';
import { WorkspaceOutput } from '@brainbox/core';

export class WorkspaceDeleteMutationHandler
  implements MutationHandler<WorkspaceDeleteMutationInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  async handleMutation(
    input: WorkspaceDeleteMutationInput
  ): Promise<WorkspaceDeleteMutationOutput> {
    const accountService = this.app.getAccount(input.accountId);

    if (!accountService) {
      throw new MutationError(
        MutationErrorCode.AccountNotFound,
        'Account not found or has been logged out.'
      );
    }

    const workspaceService = accountService.getWorkspace(input.workspaceId);
    if (!workspaceService) {
      throw new MutationError(
        MutationErrorCode.WorkspaceNotFound,
        'Workspace not found.'
      );
    }

    try {
      const response = await accountService.client
        .delete(`v1/workspaces/${input.workspaceId}`)
        .json<WorkspaceOutput>();

      await accountService.deleteWorkspace(response.id);

      return {
        id: response.id,
      };
    } catch (error) {
      const apiError = await parseApiError(error);
      throw new MutationError(MutationErrorCode.ApiError, apiError.message);
    }
  }
}
