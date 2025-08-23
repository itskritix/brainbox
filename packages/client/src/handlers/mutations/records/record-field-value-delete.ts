import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  RecordFieldValueDeleteMutationInput,
  RecordFieldValueDeleteMutationOutput,
} from '@brainbox/client/mutations/records/record-field-value-delete';
import { RecordAttributes } from '@brainbox/core';

export class RecordFieldValueDeleteMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<RecordFieldValueDeleteMutationInput>
{
  async handleMutation(
    input: RecordFieldValueDeleteMutationInput
  ): Promise<RecordFieldValueDeleteMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const result = await workspace.nodes.updateNode<RecordAttributes>(
      input.recordId,
      (attributes) => {
        delete attributes.fields[input.fieldId];
        return attributes;
      }
    );

    if (result === 'unauthorized') {
      throw new MutationError(
        MutationErrorCode.RecordUpdateForbidden,
        "You don't have permission to delete this field value."
      );
    }

    if (result !== 'success') {
      throw new MutationError(
        MutationErrorCode.RecordUpdateFailed,
        'Something went wrong while deleting the field value. Please try again later.'
      );
    }

    return {
      success: true,
    };
  }
}
