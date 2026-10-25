import { QueryClient } from '@tanstack/react-query';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: FIVE_MINUTES_MS,
        refetchOnWindowFocus: false,
      },
    },
  });
}
