import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  ChannelDeleteMutationInput,
  ChannelDeleteMutationOutput,
} from '@brainbox/client/mutations/channels/channel-delete';

export class ChannelDeleteMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<ChannelDeleteMutationInput>
{
  async handleMutation(
    input: ChannelDeleteMutationInput
  ): Promise<ChannelDeleteMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    await workspace.nodes.deleteNode(input.channelId);

    return {
      success: true,
    };
  }
}
