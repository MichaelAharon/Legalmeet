'use client';

import Link from 'next/link';
import { FileText, Plus, Shield, Briefcase, TrendingUp, Code2, GitMerge, Truck } from 'lucide-react';
import { Button, Card, CardContent, Badge, Skeleton } from '@legalmeet/ui';
import { useNDATemplates } from '@/hooks/useNDA';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils/cn';

const categoryConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  general: { icon: Shield, color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  employment: { icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  investment: { icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900' },
  technology: { icon: Code2, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900' },
  mergers: { icon: GitMerge, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900' },
  vendor: { icon: Truck, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900' },
};

export default function TemplatesPage() {
  const { data: templates, isLoading } = useNDATemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NDA Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Pre-built and custom templates for your legal documents</p>
        </div>
        <Button asChild>
          <Link href="/templates/new"><Plus className="h-4 w-4 mr-2" />New Template</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : !templates?.length ? (
        <EmptyState icon={FileText} title="No templates" description="Create your first NDA template." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((t: any) => {
            const cat = categoryConfig[t.category] || categoryConfig.general;
            const CatIcon = cat.icon;
            return (
              <Link key={t.id} href={`/templates/${t.id}`}>
                <Card className="hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', cat.bgColor)}>
                        <CatIcon className={cn('h-5 w-5', cat.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">{t.name}</p>
                          {t.isDefault && <Badge variant="default" className="text-[10px]">Default</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{t.description || 'Custom NDA template'}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{t.category || 'general'}</Badge>
                          <span className="text-[10px] text-slate-400">v{t.version}</span>
                          <span className="text-[10px] text-slate-400">{t.templateVars?.length || 0} variables</span>
                          <Badge variant={t.status === 'active' ? 'success' : 'outline'} className="text-[10px] ml-auto">{t.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
