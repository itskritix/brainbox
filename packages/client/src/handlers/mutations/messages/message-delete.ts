import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  MessageDeleteMutationInput,
  MessageDeleteMutationOutput,
} from '@brainbox/client/mutations';

export class MessageDeleteMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<MessageDeleteMutationInput>
{
  async handleMutation(
    input: MessageDeleteMutationInput
  ): Promise<MessageDeleteMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    await workspace.nodes.deleteNode(input.messageId);

    return {
      success: true,
    };
  }
}
