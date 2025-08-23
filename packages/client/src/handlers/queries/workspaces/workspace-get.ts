import { SelectWorkspace } from '@brainbox/client/databases/account';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib';
import { mapWorkspace } from '@brainbox/client/lib/mappers';
import { WorkspaceGetQueryInput } from '@brainbox/client/queries/workspaces/workspace-get';
import { AppService } from '@brainbox/client/services/app-service';
import { Event } from '@brainbox/client/types/events';
import { Workspace } from '@brainbox/client/types/workspaces';

export class WorkspaceGetQueryHandler
  implements QueryHandler<WorkspaceGetQueryInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(
    input: WorkspaceGetQueryInput
  ): Promise<Workspace | null> {
    const row = await this.fetchWorkspace(input.accountId, input.workspaceId);
    if (!row) {
      return null;
    }

    return mapWorkspace(row);
  }

  public async checkForChanges(
    event: Event,
    input: WorkspaceGetQueryInput,
    _: Workspace | null
  ): Promise<ChangeCheckResult<WorkspaceGetQueryInput>> {
    if (
      event.type === 'workspace.created' &&
      event.workspace.accountId === input.accountId &&
      event.workspace.id === input.workspaceId
    ) {
      return {
        hasChanges: true,
        result: event.workspace,
      };
    }

    if (
      event.type === 'workspace.updated' &&
      event.workspace.accountId === input.accountId &&
      event.workspace.id === input.workspaceId
    ) {
      return {
        hasChanges: true,
        result: event.workspace,
      };
    }

    if (
      event.type === 'workspace.deleted' &&
      event.workspace.accountId === input.accountId &&
      event.workspace.id === input.workspaceId
    ) {
      return {
        hasChanges: true,
        result: null,
      };
    }

    return {
      hasChanges: false,
    };
  }

  private async fetchWorkspace(
    accountId: string,
    workspaceId: string
  ): Promise<SelectWorkspace | undefined> {
    const account = this.app.getAccount(accountId);
    if (!account) {
      return undefined;
    }

    const workspace = await account.database
      .selectFrom('workspaces')
      .selectAll()
      .where('id', '=', workspaceId)
      .executeTakeFirst();

    return workspace;
  }
}
