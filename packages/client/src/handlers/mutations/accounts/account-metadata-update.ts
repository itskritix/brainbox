import { eventBus } from '@brainbox/client/lib/event-bus';
import { mapAccountMetadata } from '@brainbox/client/lib/mappers';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  AccountMetadataUpdateMutationInput,
  AccountMetadataUpdateMutationOutput,
} from '@brainbox/client/mutations/accounts/account-metadata-update';
import { AppService } from '@brainbox/client/services/app-service';

export class AccountMetadataUpdateMutationHandler
  implements MutationHandler<AccountMetadataUpdateMutationInput>
{
  private readonly app: AppService;

  constructor(appService: AppService) {
    this.app = appService;
  }

  public async handleMutation(
    input: AccountMetadataUpdateMutationInput
  ): Promise<AccountMetadataUpdateMutationOutput> {
    const account = this.app.getAccount(input.accountId);

    if (!account) {
      return {
        success: false,
      };
    }

    const updatedMetadata = await account.database
      .insertInto('metadata')
      .returningAll()
      .values({
        key: input.key,
        value: JSON.stringify(input.value),
        created_at: new Date().toISOString(),
      })
      .onConflict((cb) =>
        cb.columns(['key']).doUpdateSet({
          value: JSON.stringify(input.value),
          updated_at: new Date().toISOString(),
        })
      )
      .executeTakeFirst();

    if (!updatedMetadata) {
      return {
        success: false,
      };
    }

    eventBus.publish({
      type: 'account.metadata.updated',
      accountId: input.accountId,
      metadata: mapAccountMetadata(updatedMetadata),
    });

    return {
      success: true,
    };
  }
}
