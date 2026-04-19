'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useNDATemplates() {
  return useQuery({
    queryKey: ['nda-templates'],
    queryFn: async () => {
      const res = await fetch('/api/nda/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
  });
}

export function useNDATemplate(templateId: string) {
  return useQuery({
    queryKey: ['nda-templates', templateId],
    queryFn: async () => {
      const res = await fetch(`/api/nda/templates/${templateId}`);
      if (!res.ok) throw new Error('Failed to fetch template');
      return res.json();
    },
    enabled: !!templateId,
  });
}

export function useCreateNDATemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; content: string; templateVars?: any[] }) => {
      const res = await fetch('/api/nda/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to create template');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nda-templates'] }),
  });
}

export function useSignNDA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { meetingId: string; participantId?: string; signatureData: string; signerName: string; signerEmail: string }) => {
      const res = await fetch('/api/nda/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to sign NDA');
      return res.json();
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['nda-signatures', vars.meetingId] });
      qc.invalidateQueries({ queryKey: ['meetings', vars.meetingId] });
    },
  });
}

export function useNDASignatureStatus(meetingId: string) {
  return useQuery({
    queryKey: ['nda-signatures', meetingId, 'status'],
    queryFn: async () => {
      const res = await fetch(`/api/nda/verify?meetingId=${meetingId}&checkAll=true`);
      if (!res.ok) throw new Error('Failed to check signatures');
      return res.json();
    },
    enabled: !!meetingId,
  });
}

export function useGenerateNDA() {
  return useMutation({
    mutationFn: async (data: { description: string }) => {
      const res = await fetch('/api/nda/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate NDA');
      }
      return res.json();
    },
  });
}

export function useNDASignatures(meetingId: string) {
  return useQuery({
    queryKey: ['nda-signatures', meetingId],
    queryFn: async () => {
      const res = await fetch(`/api/nda/verify?meetingId=${meetingId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!meetingId,
  });
}
