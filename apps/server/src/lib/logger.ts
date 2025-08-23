import logger from 'pino';

import { config } from '@brainbox/server/lib/config';

export const createLogger = (name: string) => {
  const level = config.logging.level;

  return logger({
    level,
    name,
  });
};
