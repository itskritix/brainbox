import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  RecordCreateMutationInput,
  RecordCreateMutationOutput,
} from '@brainbox/client/mutations/records/record-create';
import { generateId, IdType, RecordAttributes } from '@brainbox/core';

export class RecordCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<RecordCreateMutationInput>
{
  async handleMutation(
    input: RecordCreateMutationInput
  ): Promise<RecordCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const id = generateId(IdType.Record);
    const attributes: RecordAttributes = {
      type: 'record',
      parentId: input.databaseId,
      databaseId: input.databaseId,
      name: input.name ?? '',
      fields: input.fields ?? {},
    };

    await workspace.nodes.createNode({
      id,
      attributes,
      parentId: input.databaseId,
    });

    return {
      id: id,
    };
  }
}
