import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  SpaceDeleteMutationInput,
  SpaceDeleteMutationOutput,
} from '@brainbox/client/mutations/spaces/space-delete';

export class SpaceDeleteMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<SpaceDeleteMutationInput>
{
  async handleMutation(
    input: SpaceDeleteMutationInput
  ): Promise<SpaceDeleteMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    await workspace.nodes.deleteNode(input.spaceId);

    return {
      success: true,
    };
  }
}
