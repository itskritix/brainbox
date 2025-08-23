import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  PageUpdateMutationInput,
  PageUpdateMutationOutput,
} from '@brainbox/client/mutations/pages/page-update';
import { PageAttributes } from '@brainbox/core';

export class PageUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<PageUpdateMutationInput>
{
  async handleMutation(
    input: PageUpdateMutationInput
  ): Promise<PageUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const result = await workspace.nodes.updateNode<PageAttributes>(
      input.pageId,
      (attributes) => {
        attributes.name = input.name;
        attributes.avatar = input.avatar;

        return attributes;
      }
    );

    if (result === 'unauthorized') {
      throw new MutationError(
        MutationErrorCode.PageUpdateForbidden,
        "You don't have permission to update this page."
      );
    }

    if (result !== 'success') {
      throw new MutationError(
        MutationErrorCode.PageUpdateFailed,
        'Something went wrong while updating the page. Please try again later.'
      );
    }

    return {
      success: true,
    };
  }
}
