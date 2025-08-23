import { WorkspaceQueryHandlerBase } from '@brainbox/client/handlers/queries/workspace-query-handler-base';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { fetchNodeTree } from '@brainbox/client/lib/utils';
import { NodeTreeGetQueryInput } from '@brainbox/client/queries/nodes/node-tree-get';
import { Event } from '@brainbox/client/types/events';
import { LocalNode } from '@brainbox/client/types/nodes';

export class NodeTreeGetQueryHandler
  extends WorkspaceQueryHandlerBase
  implements QueryHandler<NodeTreeGetQueryInput>
{
  public async handleQuery(input: NodeTreeGetQueryInput): Promise<LocalNode[]> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    const tree = await fetchNodeTree(workspace.database, input.nodeId);
    return tree;
  }

  public async checkForChanges(
    event: Event,
    input: NodeTreeGetQueryInput,
    output: LocalNode[]
  ): Promise<ChangeCheckResult<NodeTreeGetQueryInput>> {
    if (
      event.type === 'workspace.deleted' &&
      event.workspace.accountId === input.accountId &&
      event.workspace.id === input.workspaceId
    ) {
      return {
        hasChanges: true,
        result: [],
      };
    }

    if (
      event.type === 'node.created' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.nodeId
    ) {
      const newResult = await this.handleQuery(input);
      return {
        hasChanges: true,
        result: newResult,
      };
    }

    if (
      event.type === 'node.updated' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId
    ) {
      const node = output.find((n) => n.id === event.node.id);
      if (node) {
        const newResult = await this.handleQuery(input);
        return {
          hasChanges: true,
          result: newResult,
        };
      }
    }

    if (
      event.type === 'node.deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId
    ) {
      const node = output.find((n) => n.id === event.node.id);
      if (node) {
        const newResult = await this.handleQuery(input);
        return {
          hasChanges: true,
          result: newResult,
        };
      }
    }

    return {
      hasChanges: false,
      result: output,
    };
  }
}
