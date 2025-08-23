import { Emoji } from '@brainbox/client/types/emojis';

export type EmojiListQueryInput = {
  type: 'emoji.list';
  category: string;
  page: number;
  count: number;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'emoji.list': {
      input: EmojiListQueryInput;
      output: Emoji[];
    };
  }
}
