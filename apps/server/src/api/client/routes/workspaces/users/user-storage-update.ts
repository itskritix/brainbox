import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';

import {
  ApiErrorCode,
  apiErrorOutputSchema,
  userOutputSchema,
  userStorageUpdateInputSchema,
} from '@brainbox/core';
import { database } from '@brainbox/server/data/database';
import { eventBus } from '@brainbox/server/lib/event-bus';

export const userStorageUpdateRoute: FastifyPluginCallbackZod = (
  instance,
  _,
  done
) => {
  instance.route({
    method: 'PATCH',
    url: '/:userId/storage',
    schema: {
      params: z.object({
        userId: z.string(),
      }),
      body: userStorageUpdateInputSchema,
      response: {
        200: userOutputSchema,
        400: apiErrorOutputSchema,
        403: apiErrorOutputSchema,
        404: apiErrorOutputSchema,
      },
    },
    handler: async (request, reply) => {
      const userId = request.params.userId;
      const input = request.body;
      const user = request.user;

      if (user.role !== 'owner' && user.role !== 'admin') {
        return reply.code(403).send({
          code: ApiErrorCode.UserUpdateNoAccess,
          message: 'You do not have access to update users to this workspace.',
        });
      }

      const userToUpdate = await database
        .selectFrom('users')
        .selectAll()
        .where('id', '=', userId)
        .executeTakeFirst();

      if (!userToUpdate) {
        return reply.code(404).send({
          code: ApiErrorCode.UserNotFound,
          message: 'User not found.',
        });
      }

      const storageLimit = BigInt(input.storageLimit);
      const maxFileSize = BigInt(input.maxFileSize);

      if (maxFileSize > storageLimit) {
        return reply.code(400).send({
          code: ApiErrorCode.ValidationError,
          message: 'Max file size cannot be larger than storage limit.',
        });
      }

      const updatedUser = await database
        .updateTable('users')
        .returningAll()
        .set({
          storage_limit: storageLimit.toString(),
          max_file_size: maxFileSize.toString(),
          updated_at: new Date(),
          updated_by: user.account_id,
        })
        .where('id', '=', userToUpdate.id)
        .executeTakeFirst();

      if (!updatedUser) {
        return reply.code(400).send({
          code: ApiErrorCode.UserNotFound,
          message: 'User not found.',
        });
      }

      eventBus.publish({
        type: 'user.updated',
        userId: userToUpdate.id,
        accountId: userToUpdate.account_id,
        workspaceId: userToUpdate.workspace_id,
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        customName: updatedUser.custom_name,
        customAvatar: updatedUser.custom_avatar,
        createdAt: updatedUser.created_at.toISOString(),
        updatedAt: updatedUser.updated_at?.toISOString() ?? null,
        revision: updatedUser.revision,
        status: updatedUser.status,
      };
    },
  });

  done();
};
