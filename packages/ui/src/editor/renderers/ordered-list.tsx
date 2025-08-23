import { JSONContent } from '@tiptap/core';

import { defaultClasses } from '@brainbox/ui/editor/classes';
import { NodeChildrenRenderer } from '@brainbox/ui/editor/renderers/node-children';

interface OrderedListRendererProps {
  node: JSONContent;
  keyPrefix: string | null;
}

export const OrderedListRenderer = ({
  node,
  keyPrefix,
}: OrderedListRendererProps) => {
  return (
    <ol className={defaultClasses.orderedList}>
      <NodeChildrenRenderer node={node} keyPrefix={keyPrefix} />
    </ol>
  );
};
