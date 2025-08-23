import { EmojiPickerItemsRow } from '@brainbox/client/types';
import { EmojiPickerItem } from '@brainbox/ui/components/emojis/emoji-picker-item';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface EmojiBrowserItemsProps {
  row: EmojiPickerItemsRow;
  style: React.CSSProperties;
}

export const EmojiBrowserItems = ({ row, style }: EmojiBrowserItemsProps) => {
  const emojiListQuery = useLiveQuery({
    type: 'emoji.list',
    category: row.category,
    page: row.page,
    count: row.count,
  });

  const emojis = emojiListQuery.data ?? [];
  return (
    <div className="flex flex-row gap-1" style={style}>
      {emojis.map((emoji) => (
        <EmojiPickerItem key={emoji.id} emoji={emoji} />
      ))}
    </div>
  );
};
