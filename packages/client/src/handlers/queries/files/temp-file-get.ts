import { mapTempFile } from '@brainbox/client/lib';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { TempFileGetQueryInput } from '@brainbox/client/queries';
import { AppService } from '@brainbox/client/services';
import { Event } from '@brainbox/client/types/events';
import { TempFile } from '@brainbox/client/types/files';

export class TempFileGetQueryHandler
  implements QueryHandler<TempFileGetQueryInput>
{
  private readonly app: AppService;

  public constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(
    input: TempFileGetQueryInput
  ): Promise<TempFile | null> {
    return await this.fetchTempFile(input);
  }

  public async checkForChanges(
    event: Event,
    input: TempFileGetQueryInput,
    _: TempFile | null
  ): Promise<ChangeCheckResult<TempFileGetQueryInput>> {
    if (event.type === 'temp.file.created' && event.tempFile.id === input.id) {
      return {
        hasChanges: true,
        result: event.tempFile,
      };
    }

    if (event.type === 'temp.file.deleted' && event.tempFile.id === input.id) {
      return {
        hasChanges: true,
        result: null,
      };
    }

    return {
      hasChanges: false,
    };
  }

  private async fetchTempFile(
    input: TempFileGetQueryInput
  ): Promise<TempFile | null> {
    const tempFile = await this.app.database
      .selectFrom('temp_files')
      .selectAll()
      .where('id', '=', input.id)
      .executeTakeFirst();

    if (!tempFile) {
      return null;
    }

    const url = await this.app.fs.url(tempFile.path);
    return mapTempFile(tempFile, url);
  }
}
