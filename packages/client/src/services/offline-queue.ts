import { Kysely } from 'kysely';

import { eventBus } from '@brainbox/client/lib/event-bus';
import { EventLoop } from '@brainbox/client/lib/event-loop';
import { WorkspaceService } from '@brainbox/client/services/workspaces/workspace-service';
import { WorkspaceDatabaseSchema } from '@brainbox/client/databases/workspace';
import { 
  createDebugger,
  generateId,
  IdType,
  Mutation,
  MutationType,
} from '@brainbox/core';

const debug = createDebugger('desktop:service:offline-queue');

export class OfflineQueue {
  private readonly workspace: WorkspaceService;
  private readonly database: Kysely<WorkspaceDatabaseSchema>;
  private readonly eventLoop: EventLoop;
  private readonly retryDelay: number = 30000; // 30 seconds
  private isProcessing: boolean = false;
  private eventSubscriptionId: string;

  constructor(workspace: WorkspaceService) {
    this.workspace = workspace;
    this.database = workspace.database;
    
    this.eventLoop = new EventLoop(
      60000, // 1 minute intervals
      10000, // 10 second debounce
      this.processFailedMutations.bind(this)
    );

    this.eventSubscriptionId = eventBus.subscribe((event) => {
      if (
        event.type === 'account.connection.opened' &&
        event.accountId === this.workspace.accountId
      ) {
        // When connection is restored, try to sync mutations immediately
        this.workspace.mutations.scheduleSync();
        this.eventLoop.trigger();
      }
    });

    this.eventLoop.start();
  }

  public async queueMutation(mutation: Mutation): Promise<void> {
    const id = generateId(IdType.Mutation);
    
    try {
      await this.database
        .insertInto('mutations')
        .values({
          id: mutation.id,
          type: mutation.type,
          data: JSON.stringify(mutation.data),
          retries: 0,
          created_at: mutation.createdAt,
        })
        .execute();

      debug(`Queued mutation: ${mutation.type} (${mutation.id})`);
      
      eventBus.publish({
        type: 'offline.queue.operation.added',
        workspaceId: this.workspace.id,
        operationId: mutation.id,
        operationType: mutation.type,
      });

      // Schedule sync immediately if connected
      if (this.workspace.account.socket.isConnected()) {
        await this.workspace.mutations.scheduleSync();
      }
    } catch (error) {
      debug(`Failed to queue mutation ${mutation.type}: ${error}`);
      throw new Error(`Failed to queue offline mutation: ${error}`);
    }
  }

  private async processFailedMutations(): Promise<void> {
    if (this.isProcessing) {
      debug('Failed mutations processing already in progress');
      return;
    }

    if (!this.workspace.account.socket.isConnected()) {
      debug('No connection available, skipping failed mutations processing');
      return;
    }

    this.isProcessing = true;
    debug('Processing failed mutations');

    try {
      // Check for mutations that have been retried multiple times but failed
      const failedMutations = await this.database
        .selectFrom('mutations')
        .selectAll()
        .where('retries', '>', 0)
        .orderBy('created_at', 'asc')
        .limit(50) // Process in batches
        .execute();

      if (failedMutations.length > 0) {
        debug(`Found ${failedMutations.length} failed mutations to retry`);
        
        // Trigger mutation sync to retry these
        await this.workspace.mutations.scheduleSync();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public async getQueueStatus(): Promise<{
    totalMutations: number;
    pendingMutations: number;
    retriedMutations: number;
    isProcessing: boolean;
    isConnected: boolean;
  }> {
    const total = await this.database
      .selectFrom('mutations')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .executeTakeFirst();

    const pending = await this.database
      .selectFrom('mutations')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .where('retries', '=', 0)
      .executeTakeFirst();

    const retried = await this.database
      .selectFrom('mutations')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .where('retries', '>', 0)
      .executeTakeFirst();

    return {
      totalMutations: total?.count ?? 0,
      pendingMutations: pending?.count ?? 0,
      retriedMutations: retried?.count ?? 0,
      isProcessing: this.isProcessing,
      isConnected: this.workspace.account.socket.isConnected(),
    };
  }

  public async clearQueue(): Promise<void> {
    await this.database
      .deleteFrom('mutations')
      .execute();
    
    debug('Offline queue cleared');
    
    eventBus.publish({
      type: 'offline.queue.cleared',
      workspaceId: this.workspace.id,
    });
  }

  public async enhanceOfflineCapabilities(): Promise<void> {
    // Add automatic retry logic for failed mutations
    this.eventLoop.trigger();
    
    // Enable HTTP fallback when WebSocket fails
    if (!this.workspace.account.socket.isConnected()) {
      const fallbackStatus = this.workspace.account.socket.getFallbackStatus();
      if (!fallbackStatus.isActive) {
        debug('Activating HTTP fallback for offline capabilities');
        // The HTTP fallback will be activated automatically by the socket service
        // when connection failures exceed the threshold
      }
    }
  }

  public destroy(): void {
    this.eventLoop.stop();
    eventBus.unsubscribe(this.eventSubscriptionId);
  }
}