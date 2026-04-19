'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useMeetings(options?: { projectId?: string; status?: string }) {
  const params = new URLSearchParams();
  if (options?.projectId) params.set('projectId', options.projectId);
  if (options?.status) params.set('status', options.status);
  const qs = params.toString();

  return useQuery({
    queryKey: ['meetings', options],
    queryFn: async () => {
      const res = await fetch(`/api/meetings${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch meetings');
      return res.json();
    },
  });
}

export function useMeeting(meetingId: string) {
  return useQuery({
    queryKey: ['meetings', meetingId],
    queryFn: async () => {
      const res = await fetch(`/api/meetings/${meetingId}`);
      if (!res.ok) throw new Error('Failed to fetch meeting');
      return res.json();
    },
    enabled: !!meetingId,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to create meeting');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await fetch(`/api/meetings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to update meeting');
      return res.json();
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['meetings'] });
      qc.invalidateQueries({ queryKey: ['meetings', vars.id] });
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete meeting');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
  });
}

export function useCreateRoom(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/meetings/${meetingId}/room`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create room');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings', meetingId] }),
  });
}
