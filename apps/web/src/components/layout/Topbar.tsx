'use client';

import { Menu, Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { GlobalSearch } from '@/components/shared/GlobalSearch';
import { NotificationBell } from '@/components/shared/NotificationBell';

export function Topbar() {
  const { toggleSidebar, theme, toggleTheme } = useUIStore();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-4 md:px-6">
      <button onClick={toggleSidebar} className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 flex items-center justify-center">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
