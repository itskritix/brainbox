import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  RecordFieldValueSetMutationInput,
  RecordFieldValueSetMutationOutput,
} from '@brainbox/client/mutations/records/record-field-value-set';
import { RecordAttributes } from '@brainbox/core';

export class RecordFieldValueSetMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<RecordFieldValueSetMutationInput>
{
  async handleMutation(
    input: RecordFieldValueSetMutationInput
  ): Promise<RecordFieldValueSetMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const result = await workspace.nodes.updateNode<RecordAttributes>(
      input.recordId,
      (attributes) => {
        attributes.fields[input.fieldId] = input.value;
        return attributes;
      }
    );

    if (result === 'unauthorized') {
      throw new MutationError(
        MutationErrorCode.RecordUpdateForbidden,
        "You don't have permission to set this field value."
      );
    }

    if (result !== 'success') {
      throw new MutationError(
        MutationErrorCode.RecordUpdateFailed,
        'Something went wrong while setting the field value.'
      );
    }

    return {
      success: true,
    };
  }
}
