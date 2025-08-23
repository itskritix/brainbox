import { mapBlocksToContents } from '@brainbox/client/lib';
import { LocalMessageNode } from '@brainbox/client/types';
import { NodeRenderer } from '@brainbox/ui/editor/renderers/node';

interface MessageContentProps {
  message: LocalMessageNode;
}

export const MessageContent = ({ message }: MessageContentProps) => {
  const nodeBlocks = Object.values(message.attributes.content ?? {});
  const contents = mapBlocksToContents(message.id, nodeBlocks);

  return (
    <div className="text-foreground">
      {contents.map((node) => (
        <NodeRenderer
          key={node.attrs?.id}
          node={node}
          keyPrefix={node.attrs?.id}
        />
      ))}
    </div>
  );
};
