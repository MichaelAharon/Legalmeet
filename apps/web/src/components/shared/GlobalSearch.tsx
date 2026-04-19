'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { Search, X, FolderOpen, Video, FileText, Tag } from 'lucide-react';
import Link from 'next/link';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useSearch(query);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">Ctrl+K</kbd>
      </button>
    );
  }

  const hasResults = data && (data.projects?.length > 0 || data.meetings?.length > 0 || data.templates?.length > 0);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, meetings, templates..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {query && <button onClick={() => setQuery('')}><X className="h-4 w-4 text-slate-400" /></button>}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading && query && (
            <div className="p-4 text-sm text-slate-400 text-center">Searching...</div>
          )}

          {query && !isLoading && !hasResults && (
            <div className="p-4 text-sm text-slate-400 text-center">No results found</div>
          )}

          {data?.projects?.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-xs font-medium text-slate-400 uppercase">Projects</p>
              {data.projects.map((p: any) => (
                <Link key={p.id} href={`/projects/${p.id}`} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <FolderOpen className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{p.name}</span>
                </Link>
              ))}
            </div>
          )}

          {data?.meetings?.length > 0 && (
            <div className="py-2 border-t border-slate-100 dark:border-slate-700">
              <p className="px-4 py-1 text-xs font-medium text-slate-400 uppercase">Meetings</p>
              {data.meetings.map((m: any) => (
                <Link key={m.id} href={`/meetings/${m.id}`} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <Video className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{m.title}</span>
                </Link>
              ))}
            </div>
          )}

          {data?.templates?.length > 0 && (
            <div className="py-2 border-t border-slate-100 dark:border-slate-700">
              <p className="px-4 py-1 text-xs font-medium text-slate-400 uppercase">Templates</p>
              {data.templates.map((t: any) => (
                <Link key={t.id} href={`/templates/${t.id}`} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
