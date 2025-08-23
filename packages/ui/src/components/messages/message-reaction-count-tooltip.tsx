import { NodeReactionCount, LocalMessageNode } from '@brainbox/client/types';
import { MessageReactionCountTooltipContent } from '@brainbox/ui/components/messages/message-reaction-count-tooltip-content';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@brainbox/ui/components/ui/tooltip';

interface MessageReactionCountTooltipProps {
  message: LocalMessageNode;
  reactionCount: NodeReactionCount;
  children: React.ReactNode;
  onOpen: () => void;
}

export const MessageReactionCountTooltip = ({
  message,
  reactionCount,
  children,
  onOpen,
}: MessageReactionCountTooltipProps) => {
  if (reactionCount.count === 0) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent
        className="bg-background text-primary p-2 shadow-md cursor-pointer"
        onClick={onOpen}
      >
        <MessageReactionCountTooltipContent
          message={message}
          reactionCount={reactionCount}
        />
      </TooltipContent>
    </Tooltip>
  );
};
