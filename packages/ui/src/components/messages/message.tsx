import { InView } from 'react-intersection-observer';

import { LocalMessageNode } from '@brainbox/client/types';
import { MessageActions } from '@brainbox/ui/components/messages/message-actions';
import { MessageAuthorAvatar } from '@brainbox/ui/components/messages/message-author-avatar';
import { MessageAuthorName } from '@brainbox/ui/components/messages/message-author-name';
import { MessageContent } from '@brainbox/ui/components/messages/message-content';
import { MessageReactionCounts } from '@brainbox/ui/components/messages/message-reaction-counts';
import { MessageReference } from '@brainbox/ui/components/messages/message-reference';
import { MessageTime } from '@brainbox/ui/components/messages/message-time';
import { useRadar } from '@brainbox/ui/contexts/radar';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';

interface MessageProps {
  message: LocalMessageNode;
  previousMessage?: LocalMessageNode | null;
}

const shouldDisplayAuthor = (
  message: LocalMessageNode,
  previousMessage?: LocalMessageNode | null
) => {
  if (!previousMessage) {
    return true;
  }

  const previousMessageDate = new Date(previousMessage.createdAt);
  const currentMessageDate = new Date(message.createdAt);

  if (previousMessageDate.getDate() !== currentMessageDate.getDate()) {
    return true;
  }

  return previousMessage.createdBy !== message.createdBy;
};

export const Message = ({ message, previousMessage }: MessageProps) => {
  const workspace = useWorkspace();
  const radar = useRadar();
  const displayAuthor = shouldDisplayAuthor(message, previousMessage);

  return (
    <div
      id={`message-${message.id}`}
      key={`message-${message.id}`}
      className={`group flex flex-row px-1 hover:bg-gray-50 ${
        displayAuthor ? 'mt-2 first:mt-0' : ''
      }`}
    >
      <div className="mr-2 w-10 pt-1">
        {displayAuthor && <MessageAuthorAvatar message={message} />}
      </div>

      <div className="relative w-full">
        {displayAuthor && (
          <div className="flex flex-row items-center gap-0.5">
            <MessageAuthorName message={message} />
            <MessageTime message={message} />
          </div>
        )}
        <InView
          rootMargin="50px"
          onChange={(inView) => {
            if (inView) {
              radar.markNodeAsSeen(
                workspace.accountId,
                workspace.id,
                message.id
              );
            }
          }}
        >
          <MessageActions message={message} />
          {message.attributes.referenceId && (
            <MessageReference messageId={message.attributes.referenceId} />
          )}
          <MessageContent message={message} />
          <MessageReactionCounts message={message} />
        </InView>
      </div>
    </div>
  );
};
