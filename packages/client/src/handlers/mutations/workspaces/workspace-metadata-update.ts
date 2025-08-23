import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { eventBus } from '@brainbox/client/lib/event-bus';
import { mapWorkspaceMetadata } from '@brainbox/client/lib/mappers';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  WorkspaceMetadataUpdateMutationInput,
  WorkspaceMetadataUpdateMutationOutput,
} from '@brainbox/client/mutations/workspaces/workspace-metadata-update';

export class WorkspaceMetadataUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<WorkspaceMetadataUpdateMutationInput>
{
  async handleMutation(
    input: WorkspaceMetadataUpdateMutationInput
  ): Promise<WorkspaceMetadataUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const updatedMetadata = await workspace.database
      .insertInto('metadata')
      .returningAll()
      .values({
        key: input.key,
        value: JSON.stringify(input.value),
        created_at: new Date().toISOString(),
      })
      .onConflict((cb) =>
        cb.columns(['key']).doUpdateSet({
          value: JSON.stringify(input.value),
          updated_at: new Date().toISOString(),
        })
      )
      .executeTakeFirst();

    if (!updatedMetadata) {
      return {
        success: false,
      };
    }

    eventBus.publish({
      type: 'workspace.metadata.updated',
      accountId: input.accountId,
      workspaceId: input.workspaceId,
      metadata: mapWorkspaceMetadata(updatedMetadata),
    });

    return {
      success: true,
    };
  }
}
