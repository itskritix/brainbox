import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  RecordDeleteMutationInput,
  RecordDeleteMutationOutput,
} from '@brainbox/client/mutations/records/record-delete';

export class RecordDeleteMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<RecordDeleteMutationInput>
{
  async handleMutation(
    input: RecordDeleteMutationInput
  ): Promise<RecordDeleteMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    await workspace.nodes.deleteNode(input.recordId);

    return {
      success: true,
    };
  }
}
