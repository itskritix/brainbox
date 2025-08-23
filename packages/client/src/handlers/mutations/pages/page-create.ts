import { SelectNode } from '@brainbox/client/databases';
import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  PageCreateMutationInput,
  PageCreateMutationOutput,
} from '@brainbox/client/mutations/pages/page-create';
import { generateId, IdType, PageAttributes, SpaceAttributes, compareString, generateFractionalIndex } from '@brainbox/core';

export class PageCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<PageCreateMutationInput>
{
  async handleMutation(
    input: PageCreateMutationInput
  ): Promise<PageCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const id = generateId(IdType.Page);
    const attributes: PageAttributes = {
      type: 'page',
      parentId: input.parentId,
      avatar: input.avatar,
      name: input.name,
    };

    await workspace.nodes.createNode({
      id,
      attributes,
      parentId: input.parentId,
    });

    // If after parameter is provided, set the position
    if (input.after !== undefined) {
      const children = await workspace.database
        .selectFrom('nodes')
        .where('parent_id', '=', input.parentId)
        .orderBy('id')
        .selectAll()
        .execute();

      await workspace.nodes.updateNode<SpaceAttributes>(
        input.parentId,
        (attributes) => {
          const newIndex = this.generateSpaceChildIndex(
            attributes,
            children,
            id,
            input.after!
          );

          if (newIndex) {
            const childrenSettings = attributes.children ?? {};
            childrenSettings[id] = {
              ...(childrenSettings[id] ?? {}),
              id: id,
              index: newIndex,
            };
            attributes.children = childrenSettings;
          }
          
          return attributes;
        }
      );
    }

    return {
      id: id,
    };
  }

  private generateSpaceChildIndex(
    attributes: SpaceAttributes,
    children: SelectNode[],
    childId: string,
    after: string | null
  ): string | null {
    const sortedById = children.toSorted((a, b) => compareString(a.id, b.id));
    const indexes: { id: string; defaultIndex: string; customIndex: string; }[] = [];
    const childrenSettings = attributes.children ?? {};
    let lastIndex: string | null = null;

    for (const child of sortedById) {
      lastIndex = generateFractionalIndex(lastIndex, null);
      indexes.push({
        id: child.id,
        defaultIndex: lastIndex,
        customIndex: childrenSettings[child.id]?.index ?? '',
      });
    }

    const sortedIndexes = indexes.sort((a, b) =>
      compareString(
        a.customIndex || a.defaultIndex,
        b.customIndex || b.defaultIndex
      )
    );

    if (after === null) {
      const firstIndex = sortedIndexes[0];
      if (!firstIndex) {
        return generateFractionalIndex(null, null);
      }

      const nextIndex = firstIndex.customIndex || firstIndex.defaultIndex;
      return generateFractionalIndex(null, nextIndex);
    }

    const afterNodeIndex = sortedIndexes.findIndex((node) => node.id === after);
    if (afterNodeIndex === -1) {
      return null;
    }

    const afterNode = sortedIndexes[afterNodeIndex];
    if (!afterNode) {
      return null;
    }

    const previousIndex = afterNode.customIndex || afterNode.defaultIndex;
    let nextIndex: string | null = null;
    if (afterNodeIndex < sortedIndexes.length - 1) {
      const nextNode = sortedIndexes[afterNodeIndex + 1];
      if (!nextNode) {
        return null;
      }

      nextIndex = nextNode.customIndex || nextNode.defaultIndex;
    }

    return generateFractionalIndex(previousIndex, nextIndex);
  }
}
