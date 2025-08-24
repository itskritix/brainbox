import { eventBus } from '@brainbox/client/lib/event-bus';
import { EventLoop } from '@brainbox/client/lib/event-loop';
import { WorkspaceService } from '@brainbox/client/services/workspaces/workspace-service';
import { AccountService } from '@brainbox/client/services/accounts/account-service';
import { createDebugger } from '@brainbox/core';

const debug = createDebugger('desktop:service:offline-manager');

export interface OfflineStatus {
  isOnline: boolean;
  isConnected: boolean;
  httpFallbackActive: boolean;
  pendingMutations: number;
  failedMutations: number;
  lastSyncAttempt?: string;
  nextRetryIn?: number;
}

export class OfflineManager {
  private readonly account: AccountService;
  private readonly workspaces: Map<string, WorkspaceService> = new Map();
  private readonly eventLoop: EventLoop;
  private readonly statusCheckInterval = 30000; // 30 seconds
  private eventSubscriptionId: string;

  constructor(account: AccountService) {
    this.account = account;
    
    this.eventLoop = new EventLoop(
      this.statusCheckInterval,
      5000, // 5 second debounce
      this.performStatusCheck.bind(this)
    );

    this.eventSubscriptionId = eventBus.subscribe((event) => {
      if (event.type === 'account.connection.opened' && event.accountId === this.account.id) {
        this.handleConnectionRestored();
      } else if (event.type === 'account.connection.closed' && event.accountId === this.account.id) {
        this.handleConnectionLost();
      } else if (event.type === 'account.connection.fallback.activated' && event.accountId === this.account.id) {
        this.handleHttpFallbackActivated();
      } else if (event.type === 'account.connection.fallback.deactivated' && event.accountId === this.account.id) {
        this.handleHttpFallbackDeactivated();
      }
    });

    this.eventLoop.start();
  }

  public registerWorkspace(workspace: WorkspaceService): void {
    this.workspaces.set(workspace.id, workspace);
    debug(`Registered workspace ${workspace.id} for offline management`);
  }

  public unregisterWorkspace(workspaceId: string): void {
    this.workspaces.delete(workspaceId);
    debug(`Unregistered workspace ${workspaceId} from offline management`);
  }

  private handleConnectionRestored(): void {
    debug('Connection restored - initiating sync for all workspaces');
    
    // Trigger sync for all registered workspaces
    for (const workspace of this.workspaces.values()) {
      workspace.mutations.scheduleSync();
      workspace.offlineQueue.enhanceOfflineCapabilities();
    }

    this.eventLoop.trigger(); // Check status immediately
  }

  private handleConnectionLost(): void {
    debug('Connection lost - offline mode activated');
    this.eventLoop.trigger(); // Check status immediately
  }

  private handleHttpFallbackActivated(): void {
    debug('HTTP fallback activated');
    this.eventLoop.trigger(); // Update status
  }

  private handleHttpFallbackDeactivated(): void {
    debug('HTTP fallback deactivated');
    this.eventLoop.trigger(); // Update status
  }

  private async performStatusCheck(): Promise<void> {
    // This method runs periodically to check system status and trigger retries
    debug('Performing offline status check');

    for (const workspace of this.workspaces.values()) {
      try {
        const queueStatus = await workspace.offlineQueue.getQueueStatus();
        
        if (queueStatus.totalMutations > 0 && queueStatus.isConnected) {
          // If we have pending mutations and connection is available, try to sync
          debug(`Found ${queueStatus.totalMutations} pending mutations for workspace ${workspace.id}`);
          await workspace.mutations.scheduleSync();
        }
      } catch (error) {
        debug(`Error checking status for workspace ${workspace.id}: ${error}`);
      }
    }
  }

  public async getOverallStatus(): Promise<OfflineStatus> {
    const isConnected = this.account.socket.isConnected();
    const httpFallbackStatus = this.account.socket.getFallbackStatus();
    
    let totalPendingMutations = 0;
    let totalFailedMutations = 0;

    for (const workspace of this.workspaces.values()) {
      try {
        const status = await workspace.offlineQueue.getQueueStatus();
        totalPendingMutations += status.pendingMutations;
        totalFailedMutations += status.retriedMutations;
      } catch (error) {
        debug(`Error getting status for workspace ${workspace.id}: ${error}`);
      }
    }

    return {
      isOnline: this.account.server.isAvailable,
      isConnected,
      httpFallbackActive: httpFallbackStatus.isActive,
      pendingMutations: totalPendingMutations,
      failedMutations: totalFailedMutations,
      lastSyncAttempt: new Date().toISOString(),
      nextRetryIn: httpFallbackStatus.canRetry ? 0 : httpFallbackStatus.nextRetryDelay,
    };
  }

  public async forceSync(): Promise<void> {
    debug('Forcing sync for all workspaces');
    
    for (const workspace of this.workspaces.values()) {
      try {
        await workspace.mutations.sync();
      } catch (error) {
        debug(`Error forcing sync for workspace ${workspace.id}: ${error}`);
      }
    }
  }

  public async clearAllQueues(): Promise<void> {
    debug('Clearing all offline queues');
    
    for (const workspace of this.workspaces.values()) {
      try {
        await workspace.offlineQueue.clearQueue();
      } catch (error) {
        debug(`Error clearing queue for workspace ${workspace.id}: ${error}`);
      }
    }
  }

  public destroy(): void {
    this.eventLoop.stop();
    eventBus.unsubscribe(this.eventSubscriptionId);
    this.workspaces.clear();
    debug('Offline manager destroyed');
  }
}