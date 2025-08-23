import { FastifyPluginCallback } from 'fastify';

import { apiErrorOutputSchema, socketInitOutputSchema } from '@brainbox/core';
import { accountAuthenticator } from '@brainbox/server/api/client/plugins/account-auth';
import { socketService } from '@brainbox/server/services/socket-service';

export const socketInitHandler: FastifyPluginCallback = (instance, _, done) => {
  instance.register(accountAuthenticator);

  instance.route({
    method: 'POST',
    url: '/',
    schema: {
      response: {
        200: socketInitOutputSchema,
        400: apiErrorOutputSchema,
        500: apiErrorOutputSchema,
      },
    },
    handler: async (request) => {
      const id = await socketService.initSocket(
        request.account,
        request.client
      );

      return {
        id,
      };
    },
  });

  done();
};
