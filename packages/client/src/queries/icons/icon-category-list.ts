import { IconCategory } from '@brainbox/client/types/icons';

export type IconCategoryListQueryInput = {
  type: 'icon.category.list';
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'icon.category.list': {
      input: IconCategoryListQueryInput;
      output: IconCategory[];
    };
  }
}
