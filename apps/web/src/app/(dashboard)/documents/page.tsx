'use client';

import { useState } from 'react';
import { Files } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@legalmeet/ui';
import { DocumentTree } from '@/components/documents/DocumentTree';
import { DocumentList } from '@/components/documents/DocumentList';

export default function DocumentsPage() {
  const [selected, setSelected] = useState<{ type: string; id: string; label: string } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-slate-500 dark:text-slate-400">Browse all documents by project, sub-project, and meeting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Tree view */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DocumentTree
              onSelect={setSelected}
              selectedId={selected?.id}
            />
          </CardContent>
        </Card>

        {/* Document list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Files className="h-4 w-4" />
              {selected ? selected.label : 'Select a project or meeting'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <DocumentList
                projectId={selected.type === 'project' ? selected.id : undefined}
                subProjectId={selected.type === 'subProject' ? selected.id : undefined}
                meetingId={selected.type === 'meeting' ? selected.id : undefined}
              />
            ) : (
              <div className="text-center py-12">
                <Files className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Select a project, sub-project, or meeting from the tree to view its documents.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
