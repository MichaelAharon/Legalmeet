'use client';

import { Check, Clock } from 'lucide-react';
import { useNDASignatureStatus } from '@/hooks/useNDA';
import { Skeleton } from '@legalmeet/ui';

export function SignatureStatusTracker({ meetingId }: { meetingId: string }) {
  const { data, isLoading } = useNDASignatureStatus(meetingId);

  if (isLoading) return <Skeleton className="h-24" />;
  if (!data) return null;

  const { allSigned, participants } = data;

  return (
    <div className="space-y-3">
      {allSigned && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-emerald-700 dark:text-emerald-300">
          <Check className="h-5 w-5" />
          <span className="font-medium text-sm">All parties have signed the NDA</span>
        </div>
      )}
      <div className="space-y-2">
        {participants?.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                p.ndaSignedAt ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {p.displayName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
              </div>
              <div>
                <p className="text-sm font-medium">{p.displayName || p.email}</p>
                <p className="text-xs text-slate-500">{p.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {p.ndaSignedAt ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">Signed</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-amber-600 dark:text-amber-400">Pending</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
