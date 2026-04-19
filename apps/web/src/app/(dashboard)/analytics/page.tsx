'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { BarChart3, FileSignature, Video, Mic, Clock, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Meetings', value: data?.meetingsTotal || 0, icon: Video, color: 'text-blue-500' },
    { label: 'Completed', value: data?.meetingsCompleted || 0, icon: TrendingUp, color: 'text-green-500' },
    { label: 'NDAs Signed', value: data?.ndasSigned || 0, icon: FileSignature, color: 'text-indigo-500' },
    { label: 'Recordings', value: data?.recordingsCount || 0, icon: Mic, color: 'text-amber-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Avg Duration */}
      {data?.avgMeetingDurationMinutes && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">Average Meeting Duration</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{data.avgMeetingDurationMinutes} minutes</p>
        </div>
      )}

      {/* Status Distribution */}
      {data?.statusDistribution && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3">Meeting Status Distribution</h3>
          <div className="space-y-2">
            {Object.entries(data.statusDistribution).map(([status, count]) => {
              const total = data.meetingsTotal || 1;
              const pct = Math.round(((count as number) / total) * 100);
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-36 capitalize">{status.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right">{count as number}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Templates */}
      {data?.topTemplates?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3">Most Used Templates</h3>
          <div className="space-y-2">
            {data.topTemplates.map((t: any) => (
              <div key={t.templateId} className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">{t.name}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{t.count} uses</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {data?.recentActivity?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3">Recent Meetings</h3>
          <div className="space-y-2">
            {data.recentActivity.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-sm text-slate-600 dark:text-slate-400">{m.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 capitalize">{m.status.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
