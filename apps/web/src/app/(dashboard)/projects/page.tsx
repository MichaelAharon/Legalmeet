'use client';

import Link from 'next/link';
import { FolderOpen, Plus } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton } from '@legalmeet/ui';
import { useProjects } from '@/hooks/useProject';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDisplay } from '@/lib/utils/dates';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button asChild><Link href="/projects/new"><Plus className="h-4 w-4 mr-2" />New Project</Link></Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : !projects?.length ? (
        <EmptyState icon={FolderOpen} title="No projects yet" description="Create your first project to organize meetings and documents."
          action={<Button asChild><Link href="/projects/new"><Plus className="h-4 w-4 mr-2" />Create Project</Link></Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.status === 'active' ? 'success' : 'outline'}>{project.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">Created {formatDisplay(project.createdAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
