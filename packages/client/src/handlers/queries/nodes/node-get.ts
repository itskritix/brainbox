import { SelectNode } from '@brainbox/client/databases';
import { WorkspaceQueryHandlerBase } from '@brainbox/client/handlers/queries/workspace-query-handler-base';
import { mapNode } from '@brainbox/client/lib';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { NodeGetQueryInput } from '@brainbox/client/queries/nodes/node-get';
import { Event } from '@brainbox/client/types/events';
import { LocalNode } from '@brainbox/client/types/nodes';

export class NodeGetQueryHandler
  extends WorkspaceQueryHandlerBase
  implements QueryHandler<NodeGetQueryInput>
{
  public async handleQuery(
    input: NodeGetQueryInput
  ): Promise<LocalNode | null> {
    const row = await this.fetchNode(input);
    return row ? mapNode(row) : null;
  }

  public async checkForChanges(
    event: Event,
    input: NodeGetQueryInput,
    _: LocalNode | null
  ): Promise<ChangeCheckResult<NodeGetQueryInput>> {
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

    if (
      event.type === 'node.created' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.nodeId
    ) {
      return {
        hasChanges: true,
        result: event.node,
      };
    }

    if (
      event.type === 'node.updated' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.nodeId
    ) {
      return {
        hasChanges: true,
        result: event.node,
      };
    }

    if (
      event.type === 'node.deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.nodeId
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

  private async fetchNode(
    input: NodeGetQueryInput
  ): Promise<SelectNode | undefined> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const row = await workspace.database
      .selectFrom('nodes')
      .selectAll()
      .where('id', '=', input.nodeId)
      .executeTakeFirst();

    return row;
  }
}
