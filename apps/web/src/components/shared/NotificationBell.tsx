'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useUnreadCount } from '@/hooks/useNotifications';
import Link from 'next/link';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadCount();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();

  const recent = ((notifications as any[]) || []).slice(0, 5);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-900 dark:text-white">Notifications</span>
              <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-indigo-500 hover:underline">View all</Link>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="p-4 text-sm text-slate-400 text-center">No notifications</div>
              ) : (
                recent.map((n: any) => (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.read) markRead.mutate(n.id); }}
                    className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      !n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
