import { MutationInput, MutationMap } from '@brainbox/client/mutations';
import { QueryInput, QueryMap } from '@brainbox/client/queries';
import { Event } from '@brainbox/client/types/events';

export interface MutationHandler<T extends MutationInput> {
  handleMutation: (input: T) => Promise<MutationMap[T['type']]['output']>;
}

export interface QueryHandler<T extends QueryInput> {
  handleQuery: (input: T) => Promise<QueryMap[T['type']]['output']>;
  checkForChanges: (
    event: Event,
    input: T,
    output: QueryMap[T['type']]['output']
  ) => Promise<ChangeCheckResult<T>>;
}

export type SubscribedQuery<T extends QueryInput> = {
  input: T;
  result: QueryMap[T['type']]['output'];
  windowIds: Set<string>;
};

export type ChangeCheckResult<T extends QueryInput> = {
  hasChanges: boolean;
  result?: QueryMap[T['type']]['output'];
};
