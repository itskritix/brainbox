import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { parseApiError } from '@brainbox/client/lib/ky';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  UserRoleUpdateMutationInput,
  UserRoleUpdateMutationOutput,
} from '@brainbox/client/mutations/users/user-role-update';
import { UserOutput, UserRoleUpdateInput } from '@brainbox/core';

export class UserRoleUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<UserRoleUpdateMutationInput>
{
  async handleMutation(
    input: UserRoleUpdateMutationInput
  ): Promise<UserRoleUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    try {
      const body: UserRoleUpdateInput = {
        role: input.role,
      };

      const output = await workspace.account.client
        .patch(`v1/workspaces/${workspace.id}/users/${input.userId}/role`, {
          json: body,
        })
        .json<UserOutput>();

      await workspace.users.upsert(output);

      return {
        success: true,
      };
    } catch (error) {
      const apiError = await parseApiError(error);
      throw new MutationError(MutationErrorCode.ApiError, apiError.message);
    }
  }
}
