import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';

import {
  AccountStatus,
  generateId,
  IdType,
  ApiErrorCode,
  apiErrorOutputSchema,
  loginOutputSchema,
  emailRegisterInputSchema,
} from '@brainbox/core';
import { database } from '@brainbox/server/data/database';
import { SelectAccount } from '@brainbox/server/data/schema';
import {
  buildLoginSuccessOutput,
  buildLoginVerifyOutput,
  generatePasswordHash,
} from '@brainbox/server/lib/accounts';
import { config } from '@brainbox/server/lib/config';
import { isAuthEmailRateLimited } from '@brainbox/server/lib/rate-limits';

export const emailRegisterRoute: FastifyPluginCallbackZod = (
  instance,
  _,
  done
) => {
  instance.route({
    method: 'POST',
    url: '/emails/register',
    schema: {
      body: emailRegisterInputSchema,
      response: {
        200: loginOutputSchema,
        400: apiErrorOutputSchema,
        429: apiErrorOutputSchema,
      },
    },
    handler: async (request, reply) => {
      const input = request.body;
      const email = input.email.toLowerCase();

      const isEmailRateLimited = await isAuthEmailRateLimited(email);
      if (isEmailRateLimited) {
        return reply.code(429).send({
          code: ApiErrorCode.TooManyRequests,
          message: 'Too many authentication attempts. Please try again later.',
        });
      }

      const existingAccount = await database
        .selectFrom('accounts')
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirst();

      const password = await generatePasswordHash(input.password);

      let account: SelectAccount | null | undefined = null;

      const status =
        config.account.verificationType === 'automatic'
          ? AccountStatus.Active
          : AccountStatus.Unverified;

      if (existingAccount) {
        if (existingAccount.status !== AccountStatus.Pending) {
          return reply.code(400).send({
            code: ApiErrorCode.EmailAlreadyExists,
            message: 'Email already exists. Login or use another email.',
          });
        }

        account = await database
          .updateTable('accounts')
          .set({
            password: password,
            name: input.name,
            updated_at: new Date(),
            status: status,
          })
          .where('id', '=', existingAccount.id)
          .returningAll()
          .executeTakeFirst();
      } else {
        account = await database
          .insertInto('accounts')
          .values({
            id: generateId(IdType.Account),
            name: input.name,
            email: email,
            password: password,
            status: status,
            created_at: new Date(),
          })
          .returningAll()
          .executeTakeFirst();
      }

      if (!account) {
        return reply.code(400).send({
          code: ApiErrorCode.AccountCreationFailed,
          message: 'Failed to create account.',
        });
      }

      if (account.status === AccountStatus.Unverified) {
        if (config.account.verificationType === 'email') {
          const output = await buildLoginVerifyOutput(account);
          return output;
        }

        return reply.code(400).send({
          code: ApiErrorCode.AccountPendingVerification,
          message:
            'Account is not verified yet. Contact your administrator to verify your account.',
        });
      }

      const output = await buildLoginSuccessOutput(account, request.client);
      return output;
    },
  });

  done();
};
