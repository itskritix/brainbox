import { WorkspaceMutationHandlerBase } from '@colanode/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@colanode/client/lib/types';
import { MutationError, MutationErrorCode } from '@colanode/client/mutations';
import {
  ChannelCreateMutationInput,
  ChannelCreateMutationOutput,
} from '@colanode/client/mutations/channels/channel-create';
import { ChannelAttributes, generateId, IdType } from '@colanode/core';

export class ChannelCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<ChannelCreateMutationInput>
{
  async handleMutation(
    input: ChannelCreateMutationInput
  ): Promise<ChannelCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const id = generateId(IdType.Channel);
    const attributes: ChannelAttributes = {
      type: 'channel',
      name: input.name,
      avatar: input.avatar,
      parentId: input.workspaceId,
      collaborators: {
        [workspace.userId]: 'admin',
      },
    };

    await workspace.nodes.createNode({
      id,
      attributes,
      parentId: input.workspaceId,
    });

    return {
      id: id,
    };
  }
}
