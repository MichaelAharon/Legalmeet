'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';

const isMock = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_USE_MOCK === 'true';

function ThemeScript() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  }));

  const content = (
    <QueryClientProvider client={queryClient}>
      <ThemeScript />
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );

  // In mock mode, skip Auth0 UserProvider
  if (isMock) return content;

  return <UserProvider>{content}</UserProvider>;
}
