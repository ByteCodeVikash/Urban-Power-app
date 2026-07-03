import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive refetching on window focus
      retry: 1, // Retry failed requests once before showing error
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    },
  },
});
