'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * TanStack Query provider.
 *
 * Default query options:
 *   staleTime  5 min  — cached data is considered fresh for 5 minutes,
 *                        so navigating back to a page that already fetched
 *                        data won't re-fetch it.
 *   gcTime    10 min  — unused query results are garbage-collected after
 *                        10 minutes.
 *   refetchOnWindowFocus false — avoids noisy re-fetches when the user
 *                        switches browser tabs.
 *
 * Usage in client components:
 *
 *   // Public / product data (cache-friendly)
 *   const { data: settings } = useQuery({
 *     queryKey: ['settings'],
 *     queryFn: () => fetch('/api/settings').then(r => r.json()),
 *   });
 *
 *   // User-specific data (never cache, always fresh)
 *   const { data: profile } = useQuery({
 *     queryKey: ['profile'],
 *     queryFn: () =>
 *       fetch('/api/auth/me', {
 *         cache: 'no-store',
 *         headers: { Authorization: `Bearer ${token}` },
 *       }).then(r => r.json()),
 *     staleTime: 0,   // override: always re-fetch
 *   });
 *
 *   // Order history (never cache)
 *   const { data: orders } = useQuery({
 *     queryKey: ['orders'],
 *     queryFn: () =>
 *       fetch('/api/orders?mine=1', { cache: 'no-store', headers: { ... } })
 *         .then(r => r.json()),
 *     staleTime: 0,
 *   });
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,   // 5 minutes
            gcTime:    1000 * 60 * 10,  // 10 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
