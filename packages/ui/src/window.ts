import { EventBus } from '@brainbox/client/lib';
import { MutationInput, MutationResult } from '@brainbox/client/mutations';
import { QueryInput, QueryMap } from '@brainbox/client/queries';
import { TempFile } from '@brainbox/client/types';

interface SaveDialogOptions {
  name: string;
}

export interface ColanodeWindowApi {
  init: () => Promise<void>;
  executeMutation: <T extends MutationInput>(
    input: T
  ) => Promise<MutationResult<T>>;
  executeQuery: <T extends QueryInput>(
    input: T
  ) => Promise<QueryMap[T['type']]['output']>;
  executeQueryAndSubscribe: <T extends QueryInput>(
    key: string,
    input: T
  ) => Promise<QueryMap[T['type']]['output']>;
  unsubscribeQuery: (key: string) => Promise<void>;
  saveTempFile: (file: File) => Promise<TempFile>;
  openExternalUrl: (url: string) => Promise<void>;
  showItemInFolder: (path: string) => Promise<void>;
  showFileSaveDialog: (
    options: SaveDialogOptions
  ) => Promise<string | undefined>;
}

declare global {
  interface Window {
    brainbox: ColanodeWindowApi;
    eventBus: EventBus;
  }
}
