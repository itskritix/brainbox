import dotenv from 'dotenv';

import { initApp } from '@brainbox/server/app';
import { migrate } from '@brainbox/server/data/database';
import { initRedis } from '@brainbox/server/data/redis';
import { eventBus } from '@brainbox/server/lib/event-bus';
import { emailService } from '@brainbox/server/services/email-service';
import { jobService } from '@brainbox/server/services/job-service';

dotenv.config({
  quiet: true,
});

const init = async () => {
  await migrate();
  await initRedis();

  initApp();

  await jobService.initQueue();
  await jobService.initWorker();

  await eventBus.init();
  await emailService.init();
};

init();
