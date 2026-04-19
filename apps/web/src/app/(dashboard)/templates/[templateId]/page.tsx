'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@legalmeet/ui';
import { useNDATemplate } from '@/hooks/useNDA';

export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = params.templateId as string;
  const { data: template, isLoading } = useNDATemplate(templateId);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96" /></div>;
  if (!template) return <div>Template not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/templates"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">v{template.version}</Badge>
              {template.isDefault && <Badge>Default</Badge>}
            </div>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Template Content</CardTitle></CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {template.content}
          </div>
        </CardContent>
      </Card>
      {template.templateVars?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Template Variables</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {template.templateVars.map((v: any) => (
                <div key={v.name} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                  <code className="text-indigo-600">{`{{${v.name}}}`}</code>
                  <span className="text-slate-500">{v.label} ({v.type}){v.required ? ' *' : ''}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
