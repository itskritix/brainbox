import { Icon } from '@brainbox/client/types/icons';

export type IconSearchQueryInput = {
  type: 'icon.search';
  query: string;
  count: number;
};

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'icon.search': {
      input: IconSearchQueryInput;
      output: Icon[];
    };
  }
}
