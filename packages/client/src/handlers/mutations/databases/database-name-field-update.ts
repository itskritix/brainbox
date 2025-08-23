import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  DatabaseNameFieldUpdateMutationInput,
  DatabaseNameFieldUpdateMutationOutput,
} from '@brainbox/client/mutations/databases/database-name-field-update';
import { DatabaseAttributes } from '@brainbox/core';

export class DatabaseNameFieldUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<DatabaseNameFieldUpdateMutationInput>
{
  async handleMutation(
    input: DatabaseNameFieldUpdateMutationInput
  ): Promise<DatabaseNameFieldUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    const result = await workspace.nodes.updateNode<DatabaseAttributes>(
      input.databaseId,
      (attributes) => {
        attributes.nameField = {
          name: input.name,
        };

        return attributes;
      }
    );

    if (result === 'unauthorized') {
      throw new MutationError(
        MutationErrorCode.DatabaseUpdateForbidden,
        "You don't have permission to update this database."
      );
    }

    if (result !== 'success') {
      throw new MutationError(
        MutationErrorCode.DatabaseUpdateFailed,
        'Something went wrong while updating the database.'
      );
    }

    return {
      success: true,
    };
  }
}
