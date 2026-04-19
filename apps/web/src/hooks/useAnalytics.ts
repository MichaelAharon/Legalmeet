'use client';

import { useQuery } from '@tanstack/react-query';

export function useAnalytics(period?: string) {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const params = period ? `?period=${period}` : '';
      const res = await fetch(`/api/analytics${params}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });
}
