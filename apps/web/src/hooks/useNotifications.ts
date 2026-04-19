'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: async () => {
      const params = unreadOnly ? '?unread=true' : '';
      const res = await fetch(`/api/notifications${params}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUnreadCount() {
  const { data } = useNotifications(true);
  return (data as any[])?.length || 0;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
      if (!res.ok) throw new Error('Failed to update notification');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      });
      if (!res.ok) throw new Error('Failed to mark all read');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
