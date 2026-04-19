'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Skeleton } from '@legalmeet/ui';
import { useProject } from '@/hooks/useProject';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) return <Skeleton className="h-64" />;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Project Settings</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Settings for {project.name}</CardTitle></CardHeader>
        <CardContent><p className="text-slate-500 text-sm">Project settings coming soon.</p></CardContent>
      </Card>
    </div>
  );
}
