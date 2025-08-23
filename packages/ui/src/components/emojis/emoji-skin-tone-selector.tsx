import { useState } from 'react';

import { EmojiElement } from '@brainbox/ui/components/emojis/emoji-element';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brainbox/ui/components/ui/popover';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { defaultEmojis } from '@brainbox/ui/lib/assets';

interface EmojiSkinToneSelectorProps {
  skinTone: number;
  onSkinToneChange: (skinTone: number) => void;
}

export const EmojiSkinToneSelector = ({
  skinTone,
  onSkinToneChange,
}: EmojiSkinToneSelectorProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const emojiGetQuery = useLiveQuery({
    type: 'emoji.get',
    id: defaultEmojis.hand,
  });

  const handleSkinToneSelection = (skinTone: number) => {
    setOpen(false);
    onSkinToneChange?.(skinTone);
  };

  if (emojiGetQuery.isPending || !emojiGetQuery.data) {
    return null;
  }

  const emoji = emojiGetQuery.data;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex h-[32px] w-6 items-center justify-center p-1 hover:bg-gray-50 ${
            open && 'bg-gray-100'
          }`}
        >
          <EmojiElement
            id={emoji.skins[skinTone || 0]?.id ?? ''}
            className="h-full w-full"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-50">
        {emoji.skins.map((skin, idx) => (
          <button
            key={`skin-selector-${skin}`}
            className={`h-6 w-6 p-1 hover:bg-gray-100 ${
              idx === skinTone && 'bg-gray-100'
            }`}
            onClick={() => handleSkinToneSelection(idx)}
          >
            <EmojiElement id={skin.id} className="h-full w-full" />
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
