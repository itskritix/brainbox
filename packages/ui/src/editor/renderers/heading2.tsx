import { JSONContent } from '@tiptap/core';

import { defaultClasses } from '@brainbox/ui/editor/classes';
import { NodeChildrenRenderer } from '@brainbox/ui/editor/renderers/node-children';

interface Heading2RendererProps {
  node: JSONContent;
  keyPrefix: string | null;
}

export const Heading2Renderer = ({
  node,
  keyPrefix,
}: Heading2RendererProps) => {
  return (
    <h2 className={defaultClasses.heading2}>
      <NodeChildrenRenderer node={node} keyPrefix={keyPrefix} />
    </h2>
  );
};
