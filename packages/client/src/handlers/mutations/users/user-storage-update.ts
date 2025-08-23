import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { parseApiError } from '@brainbox/client/lib/ky';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  UserStorageUpdateMutationInput,
  UserStorageUpdateMutationOutput,
} from '@brainbox/client/mutations/users/user-storage-update';
import { UserOutput, UserStorageUpdateInput } from '@brainbox/core';

export class UserStorageUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<UserStorageUpdateMutationInput>
{
  async handleMutation(
    input: UserStorageUpdateMutationInput
  ): Promise<UserStorageUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    try {
      const body: UserStorageUpdateInput = {
        storageLimit: input.storageLimit,
        maxFileSize: input.maxFileSize,
      };

      const output = await workspace.account.client
        .patch(`v1/workspaces/${workspace.id}/users/${input.userId}/storage`, {
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
