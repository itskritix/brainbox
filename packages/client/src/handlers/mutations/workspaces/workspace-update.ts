import { eventBus } from '@brainbox/client/lib/event-bus';
import { parseApiError } from '@brainbox/client/lib/ky';
import { mapWorkspace } from '@brainbox/client/lib/mappers';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  MutationError,
  MutationErrorCode,
  WorkspaceUpdateMutationInput,
  WorkspaceUpdateMutationOutput,
} from '@brainbox/client/mutations';
import { AppService } from '@brainbox/client/services/app-service';
import { Workspace } from '@brainbox/client/types';
import { WorkspaceUpdateInput } from '@brainbox/core';

export class WorkspaceUpdateMutationHandler
  implements MutationHandler<WorkspaceUpdateMutationInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  async handleMutation(
    input: WorkspaceUpdateMutationInput
  ): Promise<WorkspaceUpdateMutationOutput> {
    const accountService = this.app.getAccount(input.accountId);

    if (!accountService) {
      throw new MutationError(
        MutationErrorCode.AccountNotFound,
        'Account not found or has been logged out.'
      );
    }

    const workspaceService = accountService.getWorkspace(input.id);
    if (!workspaceService) {
      throw new MutationError(
        MutationErrorCode.WorkspaceNotFound,
        'Workspace not found.'
      );
    }

    try {
      const body: WorkspaceUpdateInput = {
        name: input.name,
        description: input.description,
        avatar: input.avatar,
      };

      const response = await accountService.client
        .patch(`v1/workspaces/${input.id}`, {
          json: body,
        })
        .json<Workspace>();

      const updatedWorkspace = await accountService.database
        .updateTable('workspaces')
        .returningAll()
        .set({
          name: response.name,
          description: response.description,
          avatar: response.avatar,
          role: response.role,
        })
        .where((eb) => eb.and([eb('id', '=', input.id)]))
        .executeTakeFirst();

      if (!updatedWorkspace) {
        throw new MutationError(
          MutationErrorCode.WorkspaceNotUpdated,
          'Something went wrong updating the workspace. Please try again later.'
        );
      }

      const workspace = mapWorkspace(updatedWorkspace);
      workspaceService.updateWorkspace(workspace);

      eventBus.publish({
        type: 'workspace.updated',
        workspace: workspace,
      });

      return {
        success: true,
      };
    } catch (error) {
      const apiError = await parseApiError(error);
      throw new MutationError(MutationErrorCode.ApiError, apiError.message);
    }
  }
}
