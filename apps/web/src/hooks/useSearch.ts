'use client';

import { useQuery } from '@tanstack/react-query';

export function useSearch(query: string, options?: { type?: string; tagId?: string }) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (options?.type) params.set('type', options.type);
  if (options?.tagId) params.set('tagId', options.tagId);
  const qs = params.toString();

  return useQuery({
    queryKey: ['search', query, options],
    queryFn: async () => {
      const res = await fetch(`/api/search?${qs}`);
      if (!res.ok) throw new Error('Failed to search');
      return res.json();
    },
    enabled: !!(query || options?.tagId),
  });
}
