import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';

import { ServerConfig, serverConfigSchema } from '@brainbox/core';
import { config } from '@brainbox/server/lib/config';

export const configGetRoute: FastifyPluginCallbackZod = (instance, _, done) => {
  instance.route({
    method: 'GET',
    url: '/config',
    schema: {
      response: {
        200: serverConfigSchema,
      },
    },
    handler: async (request) => {
      const output: ServerConfig = {
        name: config.server.name,
        avatar: config.server.avatar ?? '',
        version: config.server.version,
        sha: config.server.sha,
        ip: request.client.ip,
        pathPrefix: config.server.pathPrefix,
        account: {
          google: config.account.google.enabled
            ? {
                enabled: config.account.google.enabled,
                clientId: config.account.google.clientId,
              }
            : {
                enabled: false,
              },
        },
      };

      return output;
    },
  });

  done();
};
