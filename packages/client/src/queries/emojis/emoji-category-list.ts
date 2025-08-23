import { EmojiCategory } from '@brainbox/client/types/emojis';

export type EmojiCategoryListQueryInput = {
  type: 'emoji.category.list';
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'emoji.category.list': {
      input: EmojiCategoryListQueryInput;
      output: EmojiCategory[];
    };
  }
}
