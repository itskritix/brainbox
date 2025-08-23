import { EmojiPickerItem } from '@brainbox/ui/components/emojis/emoji-picker-item';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface EmojiSearchProps {
  query: string;
}

export const EmojiSearch = ({ query }: EmojiSearchProps) => {
  const emojiSearchQuery = useLiveQuery({
    type: 'emoji.search',
    query,
    count: 100,
  });

  const emojis = emojiSearchQuery.data ?? [];

  return (
    <div className="grid w-full min-w-full grid-cols-10 gap-1">
      <div className="col-span-full flex items-center py-1 pl-1 text-sm text-muted-foreground">
        <p>Search results for &quot;{query}&quot;</p>
      </div>
      {emojis.map((emoji) => (
        <EmojiPickerItem key={emoji.id} emoji={emoji} />
      ))}
    </div>
  );
};
