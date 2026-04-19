'use client';

import { useAuditLog } from '@/hooks/useAuditLog';
import { Shield, FileSignature, Play, Square, Sparkles, Eye, CalendarPlus } from 'lucide-react';

const actionIcons: Record<string, any> = {
  nda_signed: FileSignature,
  nda_viewed: Eye,
  meeting_started: Play,
  meeting_ended: Square,
  summary_generated: Sparkles,
  calendar_synced: CalendarPlus,
};

const actionLabels: Record<string, string> = {
  nda_signed: 'NDA Signed',
  nda_viewed: 'NDA Viewed',
  meeting_started: 'Meeting Started',
  meeting_ended: 'Meeting Ended',
  summary_generated: 'Summary Generated',
  calendar_synced: 'Calendar Synced',
};

export function AuditTrail({ meetingId }: { meetingId: string }) {
  const { data: logs, isLoading } = useAuditLog(meetingId);

  if (isLoading) {
    return <div className="animate-pulse space-y-3"><div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" /><div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" /></div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="h-10 w-10 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">No audit trail entries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-green-500" />
        <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">Tamper-Proof Audit Trail</h4>
        <span className="text-xs text-slate-400">({logs.length} entries)</span>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
        {(logs as any[]).map((log: any, i: number) => {
          const Icon = actionIcons[log.action] || Shield;
          return (
            <div key={log.id} className="relative flex items-start gap-4 pb-4">
              <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Icon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {actionLabels[log.action] || log.action}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                  <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                  {log.details?.signerEmail && <span className="text-xs text-slate-400">{log.details.signerEmail}</span>}
                  {log.ipAddress && <span className="text-xs text-slate-400">IP: {log.ipAddress}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
