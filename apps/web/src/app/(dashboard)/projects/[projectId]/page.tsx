'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Video, Plus, Settings, Trash2 } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Skeleton } from '@legalmeet/ui';
import { useProject, useDeleteProject } from '@/hooks/useProject';
import { useMeetings } from '@/hooks/useMeeting';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { DocumentList } from '@/components/documents/DocumentList';
import { formatDisplay } from '@/lib/utils/dates';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { data: project, isLoading } = useProject(projectId);
  const { data: meetings } = useMeetings({ projectId });
  const deleteProject = useDeleteProject();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-slate-500 text-sm">{project.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
        </div>
      </div>

      <Tabs defaultValue="meetings">
        <TabsList>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="meetings" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button asChild size="sm"><Link href={`/meetings/new?projectId=${projectId}`}><Plus className="h-4 w-4 mr-1" />New Meeting</Link></Button>
          </div>
          {!meetings?.length ? (
            <EmptyState icon={Video} title="No meetings" description="Schedule a meeting for this project." />
          ) : (
            <div className="space-y-2">
              {meetings.map((m: any) => (
                <Link key={m.id} href={`/meetings/${m.id}`}>
                  <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{m.title}</p>
                        <p className="text-xs text-slate-500">{formatDisplay(m.scheduledAt || m.createdAt)}</p>
                      </div>
                      <Badge variant={m.status === 'completed' ? 'success' : m.status === 'in_progress' ? 'warning' : 'default'}>{m.status}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentList projectId={projectId} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <Card><CardContent className="py-4"><p className="text-sm text-slate-500">Created {formatDisplay(project.createdAt)}</p></CardContent></Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog open={showDelete} onOpenChange={setShowDelete} title="Delete Project"
        description="This will permanently delete this project and all associated data. This action cannot be undone."
        onConfirm={async () => { await deleteProject.mutateAsync(projectId); router.push('/projects'); }}
        confirmText="Delete" variant="destructive" />
    </div>
  );
}
