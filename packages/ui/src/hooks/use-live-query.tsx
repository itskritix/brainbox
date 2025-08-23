import {
  useQuery as useTanstackQuery,
  UseQueryOptions as TanstackUseQueryOptions,
} from '@tanstack/react-query';
import { sha256 } from 'js-sha256';

import { QueryInput, QueryMap } from '@brainbox/client/queries';

type UseLiveQueryOptions<T extends QueryInput> = Omit<
  TanstackUseQueryOptions<QueryMap[T['type']]['output']>,
  'queryFn' | 'queryKey'
>;

export const useLiveQuery = <T extends QueryInput>(
  input: T,
  options?: UseLiveQueryOptions<T>
) => {
  const inputJson = JSON.stringify(input);
  const hash = sha256(inputJson);

  const result = useTanstackQuery({
    queryKey: [hash],
    queryFn: () => window.brainbox.executeQueryAndSubscribe(hash, input),
    ...options,
  });

  return result;
};
