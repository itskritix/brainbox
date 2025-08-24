import { BackoffCalculator } from '@brainbox/client/lib/backoff-calculator';
import { eventBus } from '@brainbox/client/lib/event-bus';
import { EventLoop } from '@brainbox/client/lib/event-loop';
import { AccountService } from '@brainbox/client/services/accounts/account-service';
import { 
  createDebugger,
  SynchronizerInput,
  SynchronizerOutputMessage,
  SynchronizerMap,
} from '@brainbox/core';

const debug = createDebugger('desktop:service:account-http-fallback');

export class AccountHttpFallback {
  private readonly account: AccountService;
  private readonly backoffCalculator: BackoffCalculator;
  private readonly eventLoop: EventLoop;
  private isActive: boolean = false;
  private pendingSyncRequests: Map<string, SynchronizerInput> = new Map();

  constructor(account: AccountService) {
    this.account = account;
    this.backoffCalculator = new BackoffCalculator();
    
    this.eventLoop = new EventLoop(
      30000, // 30 second intervals
      5000,  // 5 second debounce
      this.processPendingRequests.bind(this)
    );
  }

  public activate(): void {
    if (this.isActive) return;
    
    debug(`Activating HTTP fallback for account ${this.account.id}`);
    this.isActive = true;
    this.eventLoop.start();
    
    eventBus.publish({
      type: 'account.connection.fallback.activated',
      accountId: this.account.id,
    });
  }

  public deactivate(): void {
    if (!this.isActive) return;
    
    debug(`Deactivating HTTP fallback for account ${this.account.id}`);
    this.isActive = false;
    this.eventLoop.stop();
    this.pendingSyncRequests.clear();
    
    eventBus.publish({
      type: 'account.connection.fallback.deactivated',
      accountId: this.account.id,
    });
  }

  public addSyncRequest<T extends SynchronizerInput>(input: T): void {
    if (!this.isActive) return;
    
    const key = this.generateRequestKey(input);
    this.pendingSyncRequests.set(key, input);
    this.eventLoop.trigger();
  }

  private async processPendingRequests(): Promise<void> {
    if (!this.isActive || this.pendingSyncRequests.size === 0) {
      return;
    }

    if (!this.account.server.isAvailable) {
      debug('Server unavailable, skipping HTTP fallback sync');
      return;
    }

    if (!this.backoffCalculator.canRetry()) {
      debug('Backoff limit reached, skipping HTTP fallback sync');
      return;
    }

    debug(`Processing ${this.pendingSyncRequests.size} pending sync requests`);

    const requests = Array.from(this.pendingSyncRequests.entries());
    this.pendingSyncRequests.clear();

    for (const [key, input] of requests) {
      try {
        await this.processSyncRequest(input);
        this.backoffCalculator.reset();
      } catch (error) {
        debug(`HTTP fallback sync failed for ${input.type}: ${error}`);
        this.backoffCalculator.increaseError();
        // Re-add failed request for retry
        this.pendingSyncRequests.set(key, input);
        break; // Stop processing more requests if one fails
      }
    }
  }

  private async processSyncRequest<T extends SynchronizerInput>(
    input: T
  ): Promise<void> {
    try {
      const response = await this.account.client
        .post('v1/synchronizers/http-fallback', {
          json: {
            userId: this.account.id,
            input: input,
            cursor: '0', // HTTP fallback starts from beginning
          },
        })
        .json<{
          items: {
            cursor: string;
            data: SynchronizerMap[T['type']]['data'];
          }[];
        }>();

      // Simulate WebSocket message format for compatibility
      const message: SynchronizerOutputMessage<T> = {
        type: 'synchronizer.output' as const,
        userId: this.account.id,
        id: this.generateRequestKey(input),
        items: response.items,
      };

      eventBus.publish({
        type: 'account.connection.message.received',
        accountId: this.account.id,
        message,
      });

      debug(`HTTP fallback sync successful for ${input.type}: ${response.items.length} items`);
    } catch (error) {
      debug(`HTTP fallback request failed for ${input.type}: ${error}`);
      throw error;
    }
  }

  private generateRequestKey(input: SynchronizerInput): string {
    return `${input.type}-${JSON.stringify(input)}`;
  }

  public getStatus(): {
    isActive: boolean;
    pendingRequests: number;
    canRetry: boolean;
    nextRetryDelay: number;
  } {
    return {
      isActive: this.isActive,
      pendingRequests: this.pendingSyncRequests.size,
      canRetry: this.backoffCalculator.canRetry(),
      nextRetryDelay: this.backoffCalculator.getCurrentDelay(),
    };
  }
}