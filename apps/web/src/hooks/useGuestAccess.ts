'use client';

import { useQuery } from '@tanstack/react-query';

export function useGuestAccess(token: string) {
  return useQuery({
    queryKey: ['guest', token],
    queryFn: async () => {
      const res = await fetch(`/api/guest/${token}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invalid or expired token');
      }
      return res.json();
    },
    enabled: !!token,
    retry: false,
  });
}
