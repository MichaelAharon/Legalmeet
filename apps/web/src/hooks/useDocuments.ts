'use client';

import { useQuery } from '@tanstack/react-query';

export function useDocuments(options?: { projectId?: string; subProjectId?: string; meetingId?: string }) {
  const params = new URLSearchParams();
  if (options?.projectId) params.set('projectId', options.projectId);
  if (options?.subProjectId) params.set('subProjectId', options.subProjectId);
  if (options?.meetingId) params.set('meetingId', options.meetingId);
  const qs = params.toString();

  return useQuery({
    queryKey: ['documents', options],
    queryFn: async () => {
      const res = await fetch(`/api/documents${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    },
    enabled: !!(options?.projectId || options?.subProjectId || options?.meetingId),
  });
}
