import { MutationHandler } from '@brainbox/client/lib/types';
import {
  TempFileCreateMutationInput,
  TempFileCreateMutationOutput,
} from '@brainbox/client/mutations';
import { AppService } from '@brainbox/client/services/app-service';

export class TempFileCreateMutationHandler
  implements MutationHandler<TempFileCreateMutationInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  async handleMutation(
    input: TempFileCreateMutationInput
  ): Promise<TempFileCreateMutationOutput> {
    await this.app.database
      .insertInto('temp_files')
      .values({
        id: input.id,
        name: input.name,
        size: input.size,
        mime_type: input.mimeType,
        subtype: input.subtype,
        path: input.path,
        extension: input.extension,
        created_at: new Date().toISOString(),
        opened_at: new Date().toISOString(),
      })
      .onConflict((oc) => oc.doNothing())
      .execute();

    return {
      success: true,
    };
  }
}
