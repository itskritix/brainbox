import { eventBus } from '@brainbox/client/lib/event-bus';
import { mapAppMetadata } from '@brainbox/client/lib/mappers';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  AppMetadataUpdateMutationInput,
  AppMetadataUpdateMutationOutput,
} from '@brainbox/client/mutations/apps/app-metadata-update';
import { AppService } from '@brainbox/client/services/app-service';

export class AppMetadataUpdateMutationHandler
  implements MutationHandler<AppMetadataUpdateMutationInput>
{
  private readonly app: AppService;

  constructor(appService: AppService) {
    this.app = appService;
  }

  async handleMutation(
    input: AppMetadataUpdateMutationInput
  ): Promise<AppMetadataUpdateMutationOutput> {
    const updatedMetadata = await this.app.database
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
      type: 'app.metadata.updated',
      metadata: mapAppMetadata(updatedMetadata),
    });

    return {
      success: true,
    };
  }
}
