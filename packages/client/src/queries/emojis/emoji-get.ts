import { Emoji } from '@brainbox/client/types/emojis';

export type EmojiGetQueryInput = {
  type: 'emoji.get';
  id: string;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'emoji.get': {
      input: EmojiGetQueryInput;
      output: Emoji | null;
    };
  }
}
