'use client';

import { FileText, Video, MessageSquare, Package } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { Badge, Skeleton } from '@legalmeet/ui';
import { formatDisplay } from '@/lib/utils/dates';

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  nda: { icon: FileText, label: 'NDA', color: 'text-indigo-500' },
  recording: { icon: Video, label: 'Recording', color: 'text-emerald-500' },
  transcript: { icon: MessageSquare, label: 'Transcript', color: 'text-amber-500' },
  bundle: { icon: Package, label: 'Bundle', color: 'text-purple-500' },
};

export function DocumentList({ projectId, subProjectId, meetingId }: {
  projectId?: string;
  subProjectId?: string;
  meetingId?: string;
}) {
  const { data: documents, isLoading } = useDocuments({ projectId, subProjectId, meetingId });

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>;
  }

  if (!documents?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No documents found for this selection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc: any) => {
        const config = typeConfig[doc.type] || typeConfig.nda;
        const Icon = config.icon;
        return (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-xs text-slate-500">{doc.meetingTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline">{config.label}</Badge>
              <span className="text-xs text-slate-400">{formatDisplay(doc.date)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
