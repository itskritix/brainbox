import { EmojiElement } from '@brainbox/ui/components/emojis/emoji-element';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface MessageQuickReactionProps {
  emoji: string;
  onClick: (skinId: string) => void;
}

export const MessageQuickReaction = ({
  emoji,
  onClick,
}: MessageQuickReactionProps) => {
  const emojiGetQuery = useLiveQuery({
    type: 'emoji.get',
    id: emoji,
  });

  const skinId = emojiGetQuery.data?.skins[0]?.id;
  if (!skinId) {
    return null;
  }

  return (
    <EmojiElement
      id={skinId}
      className="size-4"
      onClick={() => onClick(skinId)}
    />
  );
};
