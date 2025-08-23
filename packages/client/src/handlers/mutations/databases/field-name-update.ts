import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  FieldNameUpdateMutationInput,
  FieldNameUpdateMutationOutput,
} from '@brainbox/client/mutations/databases/field-name-update';
import { DatabaseAttributes } from '@brainbox/core';

export class FieldNameUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<FieldNameUpdateMutationInput>
{
  async handleMutation(
    input: FieldNameUpdateMutationInput
  ): Promise<FieldNameUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const result = await workspace.nodes.updateNode<DatabaseAttributes>(
      input.databaseId,
      (attributes) => {
        const field = attributes.fields[input.fieldId];
        if (!field) {
          throw new MutationError(
            MutationErrorCode.FieldNotFound,
            'The field you are trying to update does not exist.'
          );
        }

        field.name = input.name;
        return attributes;
      }
    );

    if (result === 'unauthorized') {
      throw new MutationError(
        MutationErrorCode.FieldUpdateForbidden,
        "You don't have permission to update this field."
      );
    }

    if (result !== 'success') {
      throw new MutationError(
        MutationErrorCode.FieldUpdateFailed,
        'Something went wrong while updating the field.'
      );
    }

    return {
      id: input.fieldId,
    };
  }
}
