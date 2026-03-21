import { QueryClient } from '@tanstack/react-query'

/** Pre-configured QueryClient for tests — disables retries to avoid async timeouts */
export const queryClientMock = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})
