import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  NodeReactionDeleteMutationInput,
  NodeReactionDeleteMutationOutput,
} from '@brainbox/client/mutations/nodes/node-reaction-delete';

export class NodeReactionDeleteMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<NodeReactionDeleteMutationInput>
{
  async handleMutation(
    input: NodeReactionDeleteMutationInput
  ): Promise<NodeReactionDeleteMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    await workspace.nodeReactions.deleteNodeReaction(
      input.nodeId,
      input.reaction
    );

    return {
      success: true,
    };
  }
}
