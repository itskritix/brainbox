import { Emoji } from '@brainbox/client/types/emojis';

export type EmojiSearchQueryInput = {
  type: 'emoji.search';
  query: string;
  count: number;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'emoji.search': {
      input: EmojiSearchQueryInput;
      output: Emoji[];
    };
  }
}
