import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { eventBus } from '@brainbox/client/lib/event-bus';
import { mapWorkspaceMetadata } from '@brainbox/client/lib/mappers';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  WorkspaceMetadataDeleteMutationInput,
  WorkspaceMetadataDeleteMutationOutput,
} from '@brainbox/client/mutations/workspaces/workspace-metadata-delete';

export class WorkspaceMetadataDeleteMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<WorkspaceMetadataDeleteMutationInput>
{
  async handleMutation(
    input: WorkspaceMetadataDeleteMutationInput
  ): Promise<WorkspaceMetadataDeleteMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    const deletedMetadata = await workspace.database
      .deleteFrom('metadata')
      .where('key', '=', input.key)
      .returningAll()
      .executeTakeFirst();

    if (!deletedMetadata) {
      return {
        success: true,
      };
    }

    eventBus.publish({
      type: 'workspace.metadata.deleted',
      accountId: input.accountId,
      workspaceId: input.workspaceId,
      metadata: mapWorkspaceMetadata(deletedMetadata),
    });

    return {
      success: true,
    };
  }
}
