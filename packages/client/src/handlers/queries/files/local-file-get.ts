import { WorkspaceQueryHandlerBase } from '@brainbox/client/handlers/queries/workspace-query-handler-base';
import { mapDownload, mapLocalFile } from '@brainbox/client/lib/mappers';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import {
  LocalFileGetQueryInput,
  LocalFileGetQueryOutput,
} from '@brainbox/client/queries';
import { Event } from '@brainbox/client/types/events';
import { DownloadType } from '@brainbox/client/types/files';

export class LocalFileGetQueryHandler
  extends WorkspaceQueryHandlerBase
  implements QueryHandler<LocalFileGetQueryInput>
{
  public async handleQuery(
    input: LocalFileGetQueryInput
  ): Promise<LocalFileGetQueryOutput> {
    return await this.fetchLocalFile(input);
  }

  public async checkForChanges(
    event: Event,
    input: LocalFileGetQueryInput,
    _: LocalFileGetQueryOutput
  ): Promise<ChangeCheckResult<LocalFileGetQueryInput>> {
    if (
      event.type === 'workspace.deleted' &&
      event.workspace.accountId === input.accountId &&
      event.workspace.id === input.workspaceId
    ) {
      return {
        hasChanges: true,
        result: {
          localFile: null,
          download: null,
        },
      };
    }

    if (
      event.type === 'local.file.created' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.localFile.id === input.fileId
    ) {
      const output = await this.handleQuery(input);
      return {
        hasChanges: true,
        result: output,
      };
    }

    if (
      event.type === 'local.file.deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.localFile.id === input.fileId
    ) {
      return {
        hasChanges: true,
        result: {
          localFile: null,
          download: null,
        },
      };
    }

    if (
      event.type === 'node.deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.fileId
    ) {
      return {
        hasChanges: true,
        result: {
          localFile: null,
          download: null,
        },
      };
    }

    if (
      event.type === 'node.created' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.fileId
    ) {
      const newOutput = await this.handleQuery(input);
      return {
        hasChanges: true,
        result: newOutput,
      };
    }

    return {
      hasChanges: false,
    };
  }

  private async fetchLocalFile(
    input: LocalFileGetQueryInput
  ): Promise<LocalFileGetQueryOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const localFile = await workspace.database
      .updateTable('local_files')
      .returningAll()
      .set({
        opened_at: new Date().toISOString(),
      })
      .where('id', '=', input.fileId)
      .executeTakeFirst();

    if (localFile) {
      const url = await this.app.fs.url(localFile.path);
      return {
        localFile: mapLocalFile(localFile, url),
        download: null,
      };
    }

    const download = await workspace.database
      .selectFrom('downloads')
      .selectAll()
      .where('file_id', '=', input.fileId)
      .where('type', '=', DownloadType.Auto)
      .orderBy('id', 'desc')
      .executeTakeFirst();

    if (download) {
      return {
        localFile: null,
        download: mapDownload(download),
      };
    }

    if (input.autoDownload) {
      const download = await workspace.files.initAutoDownload(input.fileId);

      return {
        localFile: null,
        download: download ? mapDownload(download) : null,
      };
    }

    return {
      localFile: null,
      download: null,
    };
  }
}
