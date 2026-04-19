'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useMeetingSummary(meetingId: string) {
  return useQuery({
    queryKey: ['summary', meetingId],
    queryFn: async () => {
      const res = await fetch(`/api/meetings/${meetingId}/summary`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
    enabled: !!meetingId,
  });
}

export function useGenerateSummary(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/meetings/${meetingId}/summary`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate summary');
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['summary', meetingId] }),
  });
}
