import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage, isSessionAuthError } from './api-client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isSessionAuthError(error)) {
          return;
        }

        const message = getApiErrorMessage(error);
        toast.error(message, {
          id: `api-error:${query.queryHash}:${message}`,
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
