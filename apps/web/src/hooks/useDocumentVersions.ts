'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const res = await fetch(`/api/document-versions?documentId=${documentId}`);
      if (!res.ok) throw new Error('Failed to fetch versions');
      return res.json();
    },
    enabled: !!documentId,
  });
}

export function useCreateDocumentVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { documentId: string; documentType?: string; content: string; changeSummary?: string }) => {
      const res = await fetch('/api/document-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create version');
      return res.json();
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['document-versions', vars.documentId] }),
  });
}
