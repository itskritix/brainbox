import { FastifyPluginCallback } from 'fastify';

import { clientRoutes } from '@brainbox/server/api/client/routes';
import { configGetRoute } from '@brainbox/server/api/config';
import { homeRoute } from '@brainbox/server/api/home';
import { config } from '@brainbox/server/lib/config';

export const apiRoutes: FastifyPluginCallback = (instance, _, done) => {
  const prefix = config.server.pathPrefix ? `/${config.server.pathPrefix}` : '';

  instance.register(homeRoute, { prefix });
  instance.register(configGetRoute, { prefix });
  instance.register(clientRoutes, { prefix: `${prefix}/client/v1` });

  done();
};
