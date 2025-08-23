import { Icon } from '@brainbox/client/types/icons';

export type IconListQueryInput = {
  type: 'icon.list';
  category: string;
  page: number;
  count: number;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'icon.list': {
      input: IconListQueryInput;
      output: Icon[];
    };
  }
}
