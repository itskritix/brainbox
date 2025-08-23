import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { mapNode } from '@brainbox/client/lib/mappers';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  ViewCreateMutationInput,
  ViewCreateMutationOutput,
} from '@brainbox/client/mutations/databases/view-create';
import {
  generateId,
  generateFractionalIndex,
  IdType,
  DatabaseViewAttributes,
} from '@brainbox/core';

export class ViewCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<ViewCreateMutationInput>
{
  async handleMutation(
    input: ViewCreateMutationInput
  ): Promise<ViewCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const id = generateId(IdType.DatabaseView);
    const otherViews = await workspace.database
      .selectFrom('nodes')
      .selectAll()
      .where('parent_id', '=', input.databaseId)
      .where('type', '=', 'database_view')
      .execute();

    let maxIndex: string | null = null;
    for (const otherView of otherViews) {
      const view = mapNode(otherView);
      if (view.attributes.type !== 'database_view') {
        continue;
      }

      const index = view.attributes.index;
      if (maxIndex === null || index > maxIndex) {
        maxIndex = index;
      }
    }

    const attributes: DatabaseViewAttributes = {
      type: 'database_view',
      name: input.name,
      index: generateFractionalIndex(maxIndex, null),
      layout: input.viewType,
      parentId: input.databaseId,
    };

    await workspace.nodes.createNode({
      id: id,
      attributes: attributes,
      parentId: input.databaseId,
    });

    return {
      id: id,
    };
  }
}
