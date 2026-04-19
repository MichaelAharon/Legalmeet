'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, Folder, Video } from 'lucide-react';
import { useProjects } from '@/hooks/useProject';
import { useSubProjects } from '@/hooks/useSubProject';
import { useMeetings } from '@/hooks/useMeeting';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@legalmeet/ui';

interface TreeNodeProps {
  onSelect: (selection: { type: string; id: string; label: string }) => void;
  selectedId?: string;
}

function SubProjectNode({ subProject, projectId, allSubProjects, onSelect, selectedId, depth = 1 }: {
  subProject: any;
  projectId: string;
  allSubProjects: any[];
  depth?: number;
} & TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: meetings } = useMeetings({ projectId });
  const children = allSubProjects.filter((s: any) => s.parentSubProjectId === subProject.id);
  const subMeetings = (meetings || []).filter((m: any) => m.subProjectId === subProject.id);
  const isSelected = selectedId === subProject.id;

  return (
    <div>
      <button
        onClick={() => { setExpanded(!expanded); onSelect({ type: 'subProject', id: subProject.id, label: subProject.name }); }}
        className={cn(
          'w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
          isSelected && 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {(children.length > 0 || subMeetings.length > 0) ? (
          expanded ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />
        ) : <span className="w-3" />}
        <Folder className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <span className="truncate">{subProject.name}</span>
      </button>
      {expanded && (
        <>
          {children.map((child: any) => (
            <SubProjectNode
              key={child.id}
              subProject={child}
              projectId={projectId}
              allSubProjects={allSubProjects}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
          {subMeetings.map((m: any) => (
            <button
              key={m.id}
              onClick={() => onSelect({ type: 'meeting', id: m.id, label: m.title })}
              className={cn(
                'w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                selectedId === m.id && 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
              )}
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              <Video className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{m.title}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function ProjectNode({ project, onSelect, selectedId }: { project: any } & TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: subProjects, isLoading: subsLoading } = useSubProjects(project.id);
  const { data: meetings } = useMeetings({ projectId: project.id });
  const isSelected = selectedId === project.id;

  const topLevelSubs = (subProjects || []).filter((s: any) => !s.parentSubProjectId);
  const rootMeetings = (meetings || []).filter((m: any) => !m.subProjectId);

  return (
    <div>
      <button
        onClick={() => { setExpanded(!expanded); onSelect({ type: 'project', id: project.id, label: project.name }); }}
        className={cn(
          'w-full flex items-center gap-2 py-2 px-2 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
          isSelected && 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
        )}
      >
        {expanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
        <FolderOpen className="h-4 w-4 text-indigo-500 flex-shrink-0" />
        <span className="truncate">{project.name}</span>
      </button>
      {expanded && (
        <>
          {subsLoading && <Skeleton className="h-6 mx-6 my-1" />}
          {topLevelSubs.map((sub: any) => (
            <SubProjectNode
              key={sub.id}
              subProject={sub}
              projectId={project.id}
              allSubProjects={subProjects || []}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
          {rootMeetings.map((m: any) => (
            <button
              key={m.id}
              onClick={() => onSelect({ type: 'meeting', id: m.id, label: m.title })}
              className={cn(
                'w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                selectedId === m.id && 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
              )}
              style={{ paddingLeft: '40px' }}
            >
              <Video className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{m.title}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

export function DocumentTree({ onSelect, selectedId }: TreeNodeProps) {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <div className="space-y-2 p-2">{[1, 2].map(i => <Skeleton key={i} className="h-8" />)}</div>;

  if (!projects?.length) {
    return <p className="text-sm text-slate-500 p-4">No projects yet.</p>;
  }

  return (
    <div className="space-y-1 p-2">
      {projects.map((p: any) => (
        <ProjectNode key={p.id} project={p} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  );
}
