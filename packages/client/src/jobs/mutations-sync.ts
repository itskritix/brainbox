import ms from 'ms';

import {
  JobHandler,
  JobOutput,
  JobConcurrencyConfig,
} from '@brainbox/client/jobs';
import { AppService } from '@brainbox/client/services/app-service';

export type MutationsSyncInput = {
  type: 'mutations.sync';
  accountId: string;
  workspaceId: string;
};

declare module '@brainbox/client/jobs' {
  interface JobMap {
    'mutations.sync': {
      input: MutationsSyncInput;
    };
  }
}

export class MutationsSyncJobHandler implements JobHandler<MutationsSyncInput> {
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public readonly concurrency: JobConcurrencyConfig<MutationsSyncInput> = {
    limit: 1,
    key: (input: MutationsSyncInput) => `mutations.sync.${input.workspaceId}`,
  };

  public async handleJob(input: MutationsSyncInput): Promise<JobOutput> {
    const account = this.app.getAccount(input.accountId);
    if (!account) {
      return {
        type: 'cancel',
      };
    }

    if (!account.server.isAvailable) {
      return {
        type: 'retry',
        delay: ms('1 minute'),
      };
    }

    const workspace = account.getWorkspace(input.workspaceId);
    if (!workspace) {
      return {
        type: 'cancel',
      };
    }

    await workspace.mutations.sync();
    return {
      type: 'success',
    };
  }
}
