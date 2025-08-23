import { eventBus } from '@brainbox/client/lib/event-bus';
import { mapNodeInteraction } from '@brainbox/client/lib/mappers';
import { WorkspaceService } from '@brainbox/client/services/workspaces/workspace-service';
import { createDebugger, SyncNodeInteractionData } from '@brainbox/core';

const debug = createDebugger('desktop:service:node-interaction');

export class NodeInteractionService {
  private readonly workspace: WorkspaceService;

  constructor(workspaceService: WorkspaceService) {
    this.workspace = workspaceService;
  }

  public async syncServerNodeInteraction(
    nodeInteraction: SyncNodeInteractionData
  ) {
    const existingNodeInteraction = await this.workspace.database
      .selectFrom('node_interactions')
      .selectAll()
      .where('node_id', '=', nodeInteraction.nodeId)
      .where('collaborator_id', '=', nodeInteraction.collaboratorId)
      .executeTakeFirst();

    if (existingNodeInteraction) {
      if (existingNodeInteraction.revision === nodeInteraction.revision) {
        debug(
          `Server node interaction for node ${nodeInteraction.nodeId} is already synced`
        );
        return;
      }
    }

    const upsertedNodeInteraction = await this.workspace.database
      .insertInto('node_interactions')
      .returningAll()
      .values({
        node_id: nodeInteraction.nodeId,
        root_id: nodeInteraction.rootId,
        collaborator_id: nodeInteraction.collaboratorId,
        first_seen_at: nodeInteraction.firstSeenAt,
        last_seen_at: nodeInteraction.lastSeenAt,
        last_opened_at: nodeInteraction.lastOpenedAt,
        first_opened_at: nodeInteraction.firstOpenedAt,
        revision: nodeInteraction.revision,
      })
      .onConflict((b) =>
        b.columns(['node_id', 'collaborator_id']).doUpdateSet({
          last_seen_at: nodeInteraction.lastSeenAt,
          first_seen_at: nodeInteraction.firstSeenAt,
          last_opened_at: nodeInteraction.lastOpenedAt,
          first_opened_at: nodeInteraction.firstOpenedAt,
          revision: nodeInteraction.revision,
        })
      )
      .executeTakeFirst();

    if (!upsertedNodeInteraction) {
      return;
    }

    if (upsertedNodeInteraction.collaborator_id === this.workspace.userId) {
      await this.workspace.nodeCounters.checkCountersForUpdatedNodeInteraction(
        upsertedNodeInteraction,
        existingNodeInteraction
      );
    }

    eventBus.publish({
      type: 'node.interaction.updated',
      accountId: this.workspace.accountId,
      workspaceId: this.workspace.id,
      nodeInteraction: mapNodeInteraction(upsertedNodeInteraction),
    });

    debug(
      `Server node interaction for node ${nodeInteraction.nodeId} has been synced`
    );
  }
}
