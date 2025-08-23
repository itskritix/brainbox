import { Job, JobsOptions, Queue, Worker } from 'bullmq';

import { jobHandlerMap, JobHandler, JobInput } from '@brainbox/server/jobs';
import { config } from '@brainbox/server/lib/config';
import { createLogger } from '@brainbox/server/lib/logger';

const logger = createLogger('server:service:job');

class JobService {
  private jobQueue: Queue | undefined;
  private jobWorker: Worker | undefined;

  // Bullmq performs atomic operations across different keys, which can cause
  // issues with Redis clusters, so we wrap the prefix in curly braces to
  // ensure that all keys are in the same slot (Redis node)

  // for more information, see: https://docs.bullmq.io/bull/patterns/redis-cluster

  private readonly queueName = config.redis.jobs.name;
  private readonly prefix = `{${config.redis.jobs.prefix}}`;

  public async initQueue(): Promise<void> {
    if (this.jobQueue) {
      return;
    }

    this.jobQueue = new Queue(this.queueName, {
      prefix: this.prefix,
      connection: {
        db: config.redis.db,
        url: config.redis.url,
      },
      defaultJobOptions: {
        removeOnComplete: true,
      },
    });

    this.jobQueue.on('error', (error) => {
      logger.error(error, `Job queue error`);
    });

    await this.initRecurringJobs();
  }

  public async initWorker() {
    if (this.jobWorker) {
      return;
    }

    this.jobWorker = new Worker(this.queueName, this.handleJobJob, {
      prefix: this.prefix,
      connection: {
        url: config.redis.url,
        db: config.redis.db,
      },
    });
  }

  public async addJob(job: JobInput, options?: JobsOptions) {
    if (!this.jobQueue) {
      throw new Error('Job queue not initialized.');
    }

    await this.jobQueue.add(job.type, job, options);
  }

  private handleJobJob = async (job: Job) => {
    const input = job.data as JobInput;
    const handler = jobHandlerMap[input.type] as JobHandler<typeof input>;
    if (!handler) {
      if (job.opts.repeat && job.repeatJobKey) {
        await this.jobQueue?.removeJobScheduler(job.repeatJobKey);
        logger.warn(
          `Removed recurring job ${job.id} with type ${input.type} as no handler was found.`
        );
      }

      logger.warn(`Job ${job.id} with type ${input.type} not found.`);
      return;
    }

    await handler(input);

    logger.debug(`Job ${job.id} with type ${input.type} completed.`);
  };

  private async initRecurringJobs(): Promise<void> {
    await this.initNodeEmbedScanRecurringJob();
    await this.initDocumentEmbedScanRecurringJob();
    await this.initNodeUpdatesMergeRecurringJob();
    await this.initDocumentUpdatesMergeRecurringJob();
    await this.initUploadsCleanRecurringJob();
  }

  private async initNodeEmbedScanRecurringJob(): Promise<void> {
    if (!this.jobQueue) {
      return;
    }

    const id = 'node.embed.scan';
    if (config.ai.enabled) {
      this.jobQueue.upsertJobScheduler(
        id,
        { pattern: '0 */30 * * * *' },
        {
          name: id,
          data: { type: 'node.embed.scan' } as JobInput,
          opts: {
            backoff: 3,
            attempts: 5,
            removeOnFail: 1000,
          },
        }
      );
    } else {
      this.jobQueue.removeJobScheduler(id);
    }
  }

  private async initDocumentEmbedScanRecurringJob(): Promise<void> {
    if (!this.jobQueue) {
      return;
    }

    const id = 'document.embed.scan';
    if (config.ai.enabled) {
      this.jobQueue.upsertJobScheduler(
        id,
        { pattern: '0 */30 * * * *' },
        {
          name: id,
          data: { type: 'document.embed.scan' } as JobInput,
          opts: {
            backoff: 3,
            attempts: 5,
            removeOnFail: 1000,
          },
        }
      );
    } else {
      this.jobQueue.removeJobScheduler(id);
    }
  }

  private async initNodeUpdatesMergeRecurringJob(): Promise<void> {
    if (!this.jobQueue) {
      return;
    }

    const id = 'node.updates.merge';
    if (config.jobs.nodeUpdatesMerge.enabled) {
      this.jobQueue.upsertJobScheduler(
        id,
        { pattern: config.jobs.nodeUpdatesMerge.cron },
        {
          name: id,
          data: { type: 'node.updates.merge' } as JobInput,
        }
      );
      return;
    } else {
      this.jobQueue.removeJobScheduler(id);
    }
  }

  private async initDocumentUpdatesMergeRecurringJob(): Promise<void> {
    if (!this.jobQueue) {
      return;
    }

    const id = 'document.updates.merge';
    if (config.jobs.documentUpdatesMerge.enabled) {
      this.jobQueue.upsertJobScheduler(
        'document.updates.merge',
        { pattern: config.jobs.documentUpdatesMerge.cron },
        {
          name: 'document.updates.merge',
          data: { type: 'document.updates.merge' } as JobInput,
        }
      );
    } else {
      this.jobQueue.removeJobScheduler(id);
    }
  }

  private async initUploadsCleanRecurringJob(): Promise<void> {
    if (!this.jobQueue) {
      return;
    }

    const id = 'uploads.clean';
    if (config.jobs.uploadsClean.enabled) {
      this.jobQueue.upsertJobScheduler(
        id,
        { pattern: config.jobs.uploadsClean.cron },
        {
          name: id,
          data: { type: 'uploads.clean' } as JobInput,
        }
      );
    } else {
      this.jobQueue.removeJobScheduler(id);
    }
  }
}

export const jobService = new JobService();
