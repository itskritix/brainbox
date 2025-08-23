import {
  SynchronizerOutputMessage,
  SyncNodeReactionsInput,
  SyncNodeReactionData,
} from '@brainbox/core';
import { database } from '@brainbox/server/data/database';
import { SelectNodeReaction } from '@brainbox/server/data/schema';
import { createLogger } from '@brainbox/server/lib/logger';
import { BaseSynchronizer } from '@brainbox/server/synchronizers/base';
import { Event } from '@brainbox/server/types/events';

const logger = createLogger('node-reaction-synchronizer');

export class NodeReactionSynchronizer extends BaseSynchronizer<SyncNodeReactionsInput> {
  public async fetchData(): Promise<SynchronizerOutputMessage<SyncNodeReactionsInput> | null> {
    const nodeReactions = await this.fetchNodeReactions();
    if (nodeReactions.length === 0) {
      return null;
    }

    return this.buildMessage(nodeReactions);
  }

  public async fetchDataFromEvent(
    event: Event
  ): Promise<SynchronizerOutputMessage<SyncNodeReactionsInput> | null> {
    if (!this.shouldFetch(event)) {
      return null;
    }

    const nodeReactions = await this.fetchNodeReactions();
    if (nodeReactions.length === 0) {
      return null;
    }

    return this.buildMessage(nodeReactions);
  }

  private async fetchNodeReactions() {
    if (this.status === 'fetching') {
      return [];
    }

    this.status = 'fetching';

    try {
      const nodeReactions = await database
        .selectFrom('node_reactions')
        .selectAll()
        .where('root_id', '=', this.input.rootId)
        .where('revision', '>', this.cursor)
        .orderBy('revision', 'asc')
        .limit(20)
        .execute();

      return nodeReactions;
    } catch (error) {
      logger.error(error, 'Error fetching node reactions for sync');
    } finally {
      this.status = 'pending';
    }

    return [];
  }

  private buildMessage(
    unsyncedNodeReactions: SelectNodeReaction[]
  ): SynchronizerOutputMessage<SyncNodeReactionsInput> {
    const items: SyncNodeReactionData[] = unsyncedNodeReactions.map(
      (nodeReaction) => ({
        nodeId: nodeReaction.node_id,
        collaboratorId: nodeReaction.collaborator_id,
        reaction: nodeReaction.reaction,
        rootId: nodeReaction.root_id,
        workspaceId: nodeReaction.workspace_id,
        createdAt: nodeReaction.created_at.toISOString(),
        deletedAt: nodeReaction.deleted_at?.toISOString() ?? null,
        revision: nodeReaction.revision.toString(),
      })
    );

    return {
      type: 'synchronizer.output',
      userId: this.user.userId,
      id: this.id,
      items: items.map((item) => ({
        cursor: item.revision,
        data: item,
      })),
    };
  }

  private shouldFetch(event: Event) {
    if (
      event.type === 'node.reaction.created' &&
      event.rootId === this.input.rootId
    ) {
      return true;
    }

    if (
      event.type === 'node.reaction.deleted' &&
      event.rootId === this.input.rootId
    ) {
      return true;
    }

    return false;
  }
}
