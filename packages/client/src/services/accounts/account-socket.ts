import WebSocket from 'isomorphic-ws';

import { BackoffCalculator } from '@brainbox/client/lib/backoff-calculator';
import { eventBus } from '@brainbox/client/lib/event-bus';
import { AccountService } from '@brainbox/client/services/accounts/account-service';
import { AccountHttpFallback } from '@brainbox/client/services/accounts/account-http-fallback';
import { Message, SocketInitOutput, createDebugger } from '@brainbox/core';

const debug = createDebugger('desktop:service:account-socket');

export class AccountSocket {
  private readonly account: AccountService;

  private socket: WebSocket | null;
  private backoffCalculator: BackoffCalculator;
  private closingCount: number;
  private httpFallback: AccountHttpFallback;
  private connectionFailures: number = 0;
  private maxConnectionFailures: number = 3;

  constructor(account: AccountService) {
    this.account = account;
    this.socket = null;
    this.backoffCalculator = new BackoffCalculator();
    this.closingCount = 0;
    this.httpFallback = new AccountHttpFallback(account);
  }

  public async init(): Promise<void> {
    if (!this.account.server.isAvailable) {
      return;
    }

    debug(`Initializing socket connection for account ${this.account.id}`);

    if (this.socket && this.isConnected()) {
      return;
    }

    if (!this.backoffCalculator.canRetry()) {
      return;
    }

    const response = await this.account.client
      .post('v1/sockets')
      .json<SocketInitOutput>();

    this.socket = new WebSocket(
      `${this.account.server.socketBaseUrl}/v1/sockets/${response.id}`
    );

    this.socket.onmessage = async (event: WebSocket.MessageEvent) => {
      const data: string = event.data.toString();
      const message: Message = JSON.parse(data);

      debug(
        `Received message of type ${message.type} for account ${this.account.id}`
      );

      eventBus.publish({
        type: 'account.connection.message.received',
        accountId: this.account.id,
        message,
      });
    };

    this.socket.onopen = () => {
      debug(`Socket connection for account ${this.account.id} opened`);

      this.backoffCalculator.reset();
      this.connectionFailures = 0;
      this.httpFallback.deactivate();
      eventBus.publish({
        type: 'account.connection.opened',
        accountId: this.account.id,
      });
    };

    this.socket.onerror = () => {
      debug(`Socket connection for account ${this.account.id} errored`);
      this.handleConnectionFailure();
    };

    this.socket.onclose = () => {
      debug(`Socket connection for account ${this.account.id} closed`);
      this.handleConnectionFailure();
    };
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public send(message: Message): boolean {
    if (this.socket && this.isConnected()) {
      debug(
        `Sending message of type ${message.type} for account ${this.account.id}`
      );

      this.socket.send(JSON.stringify(message));
      return true;
    }

    return false;
  }

  public close(): void {
    if (this.socket) {
      debug(`Closing socket connection for account ${this.account.id}`);
      this.socket.close();
      this.socket = null;
    }
    this.httpFallback.deactivate();
  }

  private handleConnectionFailure(): void {
    this.backoffCalculator.increaseError();
    this.connectionFailures++;

    if (this.connectionFailures >= this.maxConnectionFailures) {
      debug(`Connection failed ${this.connectionFailures} times, activating HTTP fallback`);
      this.httpFallback.activate();
    }

    eventBus.publish({
      type: 'account.connection.closed',
      accountId: this.account.id,
    });
  }

  public addFallbackRequest(input: any): void {
    this.httpFallback.addSyncRequest(input);
  }

  public getFallbackStatus() {
    return this.httpFallback.getStatus();
  }

  public checkConnection(): void {
    try {
      debug(`Checking connection for account ${this.account.id}`);
      if (!this.account.server.isAvailable) {
        return;
      }

      if (this.isConnected()) {
        return;
      }

      if (this.socket == null || this.socket.readyState === WebSocket.CLOSED) {
        this.init();
        return;
      }

      if (this.socket.readyState === WebSocket.CLOSING) {
        this.closingCount++;

        if (this.closingCount > 50) {
          this.socket.terminate();
          this.closingCount = 0;
        }
      }
    } catch (error) {
      debug(
        `Error checking connection for account ${this.account.id}: ${error}`
      );
    }
  }
}
