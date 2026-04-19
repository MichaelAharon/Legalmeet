'use client';

import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent } from '@legalmeet/ui';
import { useCreateProject } from '@/hooks/useProject';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createProject.mutateAsync({ name, description });
    router.push(`/projects/${result.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Create Project</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Project Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Acme Corp Partnership" required />
            <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this project..." rows={4} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" asChild><Link href="/projects">Cancel</Link></Button>
              <Button type="submit" disabled={createProject.isPending}>{createProject.isPending ? 'Creating...' : 'Create Project'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
