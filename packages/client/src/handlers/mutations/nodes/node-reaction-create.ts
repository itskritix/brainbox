import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  NodeReactionCreateMutationInput,
  NodeReactionCreateMutationOutput,
} from '@brainbox/client/mutations/nodes/node-reaction-create';

export class NodeReactionCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<NodeReactionCreateMutationInput>
{
  async handleMutation(
    input: NodeReactionCreateMutationInput
  ): Promise<NodeReactionCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    await workspace.nodeReactions.createNodeReaction(
      input.nodeId,
      input.reaction
    );

    return {
      success: true,
    };
  }
}
