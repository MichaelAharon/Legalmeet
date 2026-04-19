'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useNDAAnalysis(meetingId?: string) {
  return useQuery({
    queryKey: ['nda-analysis', meetingId],
    queryFn: async () => {
      const params = meetingId ? `?meetingId=${meetingId}` : '';
      const res = await fetch(`/api/nda/analyze${params}`);
      if (!res.ok) throw new Error('Failed to fetch analysis');
      return res.json();
    },
    enabled: !!meetingId,
  });
}

export function useAnalyzeNDA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ndaContent: string; meetingId?: string; templateId?: string }) => {
      const res = await fetch('/api/nda/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to analyze NDA');
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      if (vars.meetingId) qc.invalidateQueries({ queryKey: ['nda-analysis', vars.meetingId] });
    },
  });
}
