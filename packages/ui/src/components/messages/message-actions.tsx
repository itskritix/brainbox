import { MessagesSquare, Reply } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { LocalMessageNode } from '@brainbox/client/types';
import { MessageDeleteButton } from '@brainbox/ui/components/messages/message-delete-button';
import { MessageQuickReaction } from '@brainbox/ui/components/messages/message-quick-reaction';
import { MessageReactionCreatePopover } from '@brainbox/ui/components/messages/message-reaction-create-popover';
import { Separator } from '@brainbox/ui/components/ui/separator';
import { useConversation } from '@brainbox/ui/contexts/conversation';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';
import { defaultEmojis } from '@brainbox/ui/lib/assets';

const MessageAction = ({ children }: { children: React.ReactNode }) => {
  return (
    <li className="flex h-8 w-7 cursor-pointer items-center justify-center hover:bg-gray-200">
      {children}
    </li>
  );
};

interface MessageActionsProps {
  message: LocalMessageNode;
}

export const MessageActions = ({ message }: MessageActionsProps) => {
  const workspace = useWorkspace();
  const conversation = useConversation();
  const { mutate, isPending } = useMutation();

  const canDelete = conversation.canDeleteMessage(message);
  const canReplyInThread = false;

  const handleReactionClick = useCallback(
    (reaction: string) => {
      if (isPending) {
        return;
      }

      mutate({
        input: {
          type: 'node.reaction.create',
          nodeId: message.id,
          accountId: workspace.accountId,
          workspaceId: workspace.id,
          reaction,
          rootId: conversation.rootId,
        },
        onError(error) {
          toast.error(error.message);
        },
      });
    },
    [isPending, mutate, workspace.userId, message.id]
  );

  return (
    <ul className="invisible absolute -top-2 right-1 z-10 flex flex-row items-center bg-gray-100 text-muted-foreground shadow group-hover:visible">
      <MessageAction>
        <MessageQuickReaction
          emoji={defaultEmojis.like}
          onClick={handleReactionClick}
        />
      </MessageAction>
      <MessageAction>
        <MessageQuickReaction
          emoji={defaultEmojis.heart}
          onClick={handleReactionClick}
        />
      </MessageAction>
      <MessageAction>
        <MessageQuickReaction
          emoji={defaultEmojis.check}
          onClick={handleReactionClick}
        />
      </MessageAction>
      <Separator orientation="vertical" className="h-6 w-[2px] mx-1" />
      {canReplyInThread && (
        <MessageAction>
          <MessagesSquare className="size-4 cursor-pointer" />
        </MessageAction>
      )}
      <MessageAction>
        <MessageReactionCreatePopover
          onReactionClick={(reaction) => {
            if (isPending) {
              return;
            }

            mutate({
              input: {
                type: 'node.reaction.create',
                nodeId: message.id,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
                reaction,
                rootId: conversation.rootId,
              },
              onError(error) {
                toast.error(error.message);
              },
            });
          }}
        />
      </MessageAction>
      {conversation.canCreateMessage && (
        <MessageAction>
          <Reply
            className="size-4 cursor-pointer"
            onClick={() => {
              conversation.onReply(message);
            }}
          />
        </MessageAction>
      )}
      {canDelete && (
        <MessageAction>
          <MessageDeleteButton id={message.id} />
        </MessageAction>
      )}
    </ul>
  );
};
