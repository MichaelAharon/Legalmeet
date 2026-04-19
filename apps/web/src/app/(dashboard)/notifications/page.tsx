'use client';

import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications';
import { Bell, CheckCheck, FileSignature, Video, Sparkles, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const typeIcons: Record<string, any> = {
  meeting_scheduled: Video,
  nda_ready: FileSignature,
  nda_signed: FileSignature,
  all_signed: CheckCheck,
  recording_ready: Video,
  summary_ready: Sparkles,
  meeting_reminder: Clock,
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  const items = (notifications as any[]) || [];
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-sm text-indigo-500 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-10 w-10 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((n: any) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead.mutate(n.id)}
                className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
                  n.read
                    ? 'bg-white dark:bg-slate-800/50'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                  n.read ? 'bg-slate-100 dark:bg-slate-700' : 'bg-indigo-100 dark:bg-indigo-900'
                }`}>
                  <Icon className={`h-4 w-4 ${n.read ? 'text-slate-400' : 'text-indigo-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
