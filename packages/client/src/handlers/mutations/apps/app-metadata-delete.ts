import { eventBus } from '@brainbox/client/lib/event-bus';
import { mapAppMetadata } from '@brainbox/client/lib/mappers';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  AppMetadataDeleteMutationInput,
  AppMetadataDeleteMutationOutput,
} from '@brainbox/client/mutations/apps/app-metadata-delete';
import { AppService } from '@brainbox/client/services/app-service';

export class AppMetadataDeleteMutationHandler
  implements MutationHandler<AppMetadataDeleteMutationInput>
{
  private readonly app: AppService;

  constructor(appService: AppService) {
    this.app = appService;
  }

  async handleMutation(
    input: AppMetadataDeleteMutationInput
  ): Promise<AppMetadataDeleteMutationOutput> {
    const deletedMetadata = await this.app.database
      .deleteFrom('metadata')
      .where('key', '=', input.key)
      .returningAll()
      .executeTakeFirst();

    if (!deletedMetadata) {
      return {
        success: true,
      };
    }

    eventBus.publish({
      type: 'app.metadata.deleted',
      metadata: mapAppMetadata(deletedMetadata),
    });

    return {
      success: true,
    };
  }
}
