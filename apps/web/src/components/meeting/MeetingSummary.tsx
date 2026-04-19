'use client';

import { useState } from 'react';
import { useMeetingSummary, useGenerateSummary } from '@/hooks/useSummary';
import { CheckCircle2, Circle, Sparkles, Clock, ListChecks, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export function MeetingSummary({ meetingId }: { meetingId: string }) {
  const { data: summary, isLoading } = useMeetingSummary(meetingId);
  const generateSummary = useGenerateSummary(meetingId);
  const [showAllItems, setShowAllItems] = useState(false);

  if (isLoading) {
    return <div className="animate-pulse space-y-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" /><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" /></div>;
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-10 w-10 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 mb-4">No summary generated yet</p>
        <button
          onClick={() => generateSummary.mutate()}
          disabled={generateSummary.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {generateSummary.isPending ? 'Generating...' : 'Generate AI Summary'}
        </button>
        {generateSummary.isError && (
          <p className="text-red-500 text-sm mt-2">{(generateSummary.error as Error).message}</p>
        )}
      </div>
    );
  }

  const sentimentColors: Record<string, string> = {
    positive: 'text-green-500', neutral: 'text-slate-400', negative: 'text-red-500', mixed: 'text-amber-500',
  };

  const actionItems = summary.actionItems || [];
  const visibleItems = showAllItems ? actionItems : actionItems.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">Summary</h4>
          <span className={`text-xs capitalize ${sentimentColors[summary.sentiment] || 'text-slate-400'}`}>
            ({summary.sentiment})
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{summary.summary}</p>
      </div>

      {/* Key Topics */}
      {summary.keyTopics?.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Key Topics</h4>
          <div className="flex flex-wrap gap-2">
            {summary.keyTopics.map((topic: string, i: number) => (
              <span key={i} className="px-2 py-1 text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">{topic}</span>
            ))}
          </div>
        </div>
      )}

      {/* Key Decisions */}
      {summary.keyDecisions?.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Key Decisions</h4>
          <ul className="space-y-1">
            {summary.keyDecisions.map((d: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="h-4 w-4 text-indigo-500" />
            <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">Action Items</h4>
            <span className="text-xs text-slate-400">({actionItems.filter((a: any) => a.completed).length}/{actionItems.length} done)</span>
          </div>
          <div className="space-y-2">
            {visibleItems.map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-md bg-slate-50 dark:bg-slate-800/50">
                {item.completed
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  : <Circle className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {item.assignee && <span className="text-xs text-slate-500">{item.assignee}</span>}
                    {item.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />{item.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {actionItems.length > 3 && (
            <button onClick={() => setShowAllItems(!showAllItems)} className="flex items-center gap-1 text-xs text-indigo-500 mt-2 hover:underline">
              {showAllItems ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Show all {actionItems.length} items</>}
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400">Generated by {summary.generatedBy} ({summary.model}) on {new Date(summary.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
