'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const res = await fetch('/api/calendar');
      if (!res.ok) throw new Error('Failed to fetch calendar events');
      return res.json();
    },
  });
}

export function useSyncToCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { meetingId: string; provider?: string; calendarId?: string }) => {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to sync to calendar');
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-events'] }),
  });
}
