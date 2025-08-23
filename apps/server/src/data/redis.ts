import { createClient } from '@redis/client';

import { config } from '@brainbox/server/lib/config';

export const redis = createClient({
  url: config.redis.url,
  database: config.redis.db,
});

export const initRedis = async () => {
  await redis.connect();

  redis.on('error', (err) => {
    console.error('Redis client error:', err);
  });
};
