import { JSONContent } from '@tiptap/core';

import { NodeChildrenRenderer } from '@brainbox/ui/editor/renderers/node-children';

interface MessageRendererProps {
  node: JSONContent;
  keyPrefix: string | null;
}

export const MessageRenderer = ({ node, keyPrefix }: MessageRendererProps) => {
  return <NodeChildrenRenderer node={node} keyPrefix={keyPrefix} />;
};
