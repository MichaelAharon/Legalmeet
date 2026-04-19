'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/billing');
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (plan: string) => {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout', plan }),
      });
      if (!res.ok) throw new Error('Failed to create checkout');
      return res.json();
    },
  });
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal' }),
      });
      if (!res.ok) throw new Error('Failed to open portal');
      return res.json();
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (!res.ok) throw new Error('Failed to cancel subscription');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}
