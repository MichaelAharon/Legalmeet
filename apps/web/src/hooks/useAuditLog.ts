'use client';

import { useQuery } from '@tanstack/react-query';

export function useAuditLog(meetingId: string) {
  return useQuery({
    queryKey: ['audit-log', meetingId],
    queryFn: async () => {
      const res = await fetch(`/api/meetings/${meetingId}/audit-log`);
      if (!res.ok) throw new Error('Failed to fetch audit log');
      return res.json();
    },
    enabled: !!meetingId,
  });
}
