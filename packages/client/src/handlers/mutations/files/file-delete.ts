import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  FileDeleteMutationInput,
  FileDeleteMutationOutput,
} from '@brainbox/client/mutations';

export class FileDeleteMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<FileDeleteMutationInput>
{
  async handleMutation(
    input: FileDeleteMutationInput
  ): Promise<FileDeleteMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    await workspace.nodes.deleteNode(input.fileId);

    return {
      success: true,
    };
  }
}
