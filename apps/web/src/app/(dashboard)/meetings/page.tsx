'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Calendar, FolderOpen, FileText, Video, MessageSquare, Package,
  ChevronRight, ChevronDown, Clock, Users, ArrowRight, FilePlus,
  Send, AlertCircle, CheckCircle2, Timer,
} from 'lucide-react';
import {
  Button, Card, CardContent, CardHeader, CardTitle, Skeleton,
  Tabs, TabsList, TabsTrigger, TabsContent, Badge, Separator,
} from '@legalmeet/ui';
import { useMeetings } from '@/hooks/useMeeting';
import { useProjects } from '@/hooks/useProject';
import { useSubProjects } from '@/hooks/useSubProject';
import { useDocuments } from '@/hooks/useDocuments';
import { MeetingCalendar } from '@/components/meetings/MeetingCalendar';
import { formatDisplay, formatRelative, formatTimeWaiting } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';

// --- Meeting row with expandable signature details ---

function MeetingRow({ meeting }: { meeting: any }) {
  const [expanded, setExpanded] = useState(false);
  const participants = meeting.participants || [];
  const pendingSigners = participants.filter((p: any) => !p.ndaSignedAt);
  const signedSigners = participants.filter((p: any) => p.ndaSignedAt);
  const hasPending = pendingSigners.length > 0 && meeting.invitesSentAt;
  const allSigned = pendingSigners.length === 0 && participants.length > 0;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Main row — clickable to expand */}
      <div
        className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'h-2 w-2 rounded-full flex-shrink-0',
            meeting.status === 'completed' ? 'bg-slate-400' :
            meeting.status === 'ready' ? 'bg-emerald-500' :
            meeting.status === 'awaiting_signatures' ? 'bg-amber-500' :
            meeting.status === 'in_progress' ? 'bg-blue-500' : 'bg-indigo-500'
          )} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{meeting.title}</p>
            <p className="text-xs text-slate-500">{formatDisplay(meeting.scheduledAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Signature summary badge */}
          {meeting.ndaRequired && meeting.invitesSentAt && (
            hasPending ? (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-medium">
                <Timer className="h-3 w-3" />
                {pendingSigners.length} pending
              </span>
            ) : allSigned ? (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                All signed
              </span>
            ) : null
          )}
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full font-medium',
            meeting.status === 'completed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
            meeting.status === 'ready' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
            meeting.status === 'awaiting_signatures' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
            'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
          )}>
            {meeting.status.replace(/_/g, ' ')}
          </span>
          <ChevronDown className={cn(
            'h-4 w-4 text-slate-400 transition-transform',
            expanded && 'rotate-180'
          )} />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-3 space-y-3">
          {/* Document sent info */}
          {meeting.invitesSentAt && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Send className="h-3.5 w-3.5 text-indigo-400" />
              <span>Document sent <strong className="text-slate-700 dark:text-slate-300">{formatDisplay(meeting.invitesSentAt)}</strong></span>
              <span className="text-slate-400">({formatRelative(meeting.invitesSentAt)})</span>
            </div>
          )}

          {/* Host signed info */}
          {meeting.hostSignedAt && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Host signed <strong className="text-slate-700 dark:text-slate-300">{formatDisplay(meeting.hostSignedAt)}</strong></span>
            </div>
          )}

          {/* Waiting time for pending signatures */}
          {hasPending && meeting.invitesSentAt && (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Waiting for {pendingSigners.length} signature{pendingSigners.length > 1 ? 's' : ''} for {formatTimeWaiting(meeting.invitesSentAt)}
              </span>
            </div>
          )}

          {/* Participant list */}
          {participants.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Participants</p>
              {participants.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white dark:bg-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn(
                      'h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0',
                      p.ndaSignedAt
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    )}>
                      {p.displayName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium truncate block">{p.displayName}</span>
                      <span className="text-slate-400 truncate block">{p.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {p.ndaSignedAt ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Signed {formatRelative(p.ndaSignedAt)}</span>
                      </>
                    ) : meeting.invitesSentAt ? (
                      <>
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400">Pending</span>
                      </>
                    ) : (
                      <span className="text-slate-400">Not sent</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick action */}
          <div className="pt-1">
            <Button variant="outline" size="sm" className="text-xs h-7" asChild>
              <Link href={`/meetings/${meeting.id}`}>
                View Details <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectMeetings({ projectId }: { projectId: string }) {
  const { data: meetings } = useMeetings();
  const projectMeetings = (meetings || []).filter((m: any) => m.projectId === projectId);

  if (projectMeetings.length === 0) {
    return <p className="text-sm text-slate-500 py-2">No meetings yet for this project.</p>;
  }

  return (
    <div className="space-y-2">
      {projectMeetings.map((m: any) => (
        <MeetingRow key={m.id} meeting={m} />
      ))}
    </div>
  );
}

function SubProjectList({ projectId }: { projectId: string }) {
  const { data: subProjects, isLoading } = useSubProjects(projectId);

  if (isLoading) return <Skeleton className="h-16" />;

  const topLevel = (subProjects || []).filter((s: any) => !s.parentSubProjectId);

  if (topLevel.length === 0) {
    return <p className="text-sm text-slate-500 py-1">No sub-projects.</p>;
  }

  return (
    <div className="space-y-1.5">
      {topLevel.map((sub: any) => (
        <div key={sub.id} className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800/50 text-sm">
          <FolderOpen className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{sub.name}</span>
          <Badge variant="outline" className="ml-auto text-[10px]">{sub.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function ProjectDocuments({ projectId }: { projectId: string }) {
  const { data: documents, isLoading } = useDocuments({ projectId });

  if (isLoading) return <Skeleton className="h-12" />;

  const docs = documents || [];

  if (docs.length === 0) {
    return <p className="text-sm text-slate-500 py-1">No documents yet.</p>;
  }

  const typeIcon: Record<string, any> = {
    nda: FileText,
    recording: Video,
    transcript: MessageSquare,
    bundle: Package,
  };

  return (
    <div className="space-y-1.5">
      {docs.slice(0, 5).map((doc: any) => {
        const Icon = typeIcon[doc.type] || FileText;
        return (
          <div key={doc.id} className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800/50 text-sm">
            <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{doc.name || doc.type}</span>
            <Badge variant="outline" className="ml-auto text-[10px] capitalize">{doc.type}</Badge>
          </div>
        );
      })}
      {docs.length > 5 && (
        <Link href="/documents" className="text-xs text-indigo-600 hover:underline">
          +{docs.length - 5} more documents
        </Link>
      )}
    </div>
  );
}

function ProjectTabContent({ project }: { project: any }) {
  return (
    <div className="space-y-5">
      {/* Project header info */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{project.description || 'No description'}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span>Created {formatRelative(project.createdAt)}</span>
            <Badge variant="outline" className="text-[10px]">{project.status}</Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${project.id}`}>
            View Project <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Sub-projects */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-slate-400" />
          Sub-Projects
        </h4>
        <SubProjectList projectId={project.id} />
      </div>

      <Separator />

      {/* Meetings — with expandable signature details */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Video className="h-4 w-4 text-slate-400" />
            Meetings
          </h4>
        </div>
        <ProjectMeetings projectId={project.id} />
      </div>

      <Separator />

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            Documents
          </h4>
          <Link href="/documents" className="text-xs text-indigo-600 hover:underline">View all</Link>
        </div>
        <ProjectDocuments projectId={project.id} />
      </div>
    </div>
  );
}

// --- Sidebar widgets ---

function RecentDocumentsWidget() {
  const { data: proj1Docs } = useDocuments({ projectId: 'proj-001' });
  const { data: proj2Docs } = useDocuments({ projectId: 'proj-002' });

  const allDocs = [...(proj1Docs || []), ...(proj2Docs || [])];
  const sorted = allDocs.sort((a: any, b: any) =>
    new Date(b.createdAt || b.signedAt || 0).getTime() - new Date(a.createdAt || a.signedAt || 0).getTime()
  );

  const typeIcon: Record<string, any> = {
    nda: FileText,
    recording: Video,
    transcript: MessageSquare,
    bundle: Package,
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Documents</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
            <Link href="/documents">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">No documents yet.</p>
        ) : (
          <div className="space-y-2">
            {sorted.slice(0, 4).map((doc: any) => {
              const Icon = typeIcon[doc.type] || FileText;
              return (
                <div key={doc.id} className="flex items-center gap-2 text-sm">
                  <div className="h-7 w-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{doc.name || doc.type}</p>
                    <p className="text-[10px] text-slate-400">{doc.meetingTitle || ''}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize flex-shrink-0">{doc.type}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Dashboard ---

export default function DashboardPage() {
  const { data: meetings, isLoading: meetingsLoading } = useMeetings();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const projectList = projects || [];
  const defaultTab = projectList.length > 0 ? projectList[0].id : '';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of your projects, meetings & documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ===== LEFT: Projects (tabbed) ===== */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-indigo-500" />
                  Projects
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/projects/new">
                    <Plus className="h-3.5 w-3.5 mr-1" />New Project
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-40" />
                </div>
              ) : projectList.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500 mb-3">No projects yet. Create your first project to get started.</p>
                  <Button asChild>
                    <Link href="/projects"><Plus className="h-4 w-4 mr-1" />Create Project</Link>
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue={defaultTab} className="w-full">
                  <TabsList className="w-full justify-start flex-wrap mb-4">
                    {projectList.map((proj: any) => (
                      <TabsTrigger key={proj.id} value={proj.id} className="text-sm">
                        {proj.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {projectList.map((proj: any) => (
                    <TabsContent key={proj.id} value={proj.id}>
                      <ProjectTabContent project={proj} />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="space-y-4">
          {/* Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {meetingsLoading ? (
                <Skeleton className="h-[320px]" />
              ) : (
                <MeetingCalendar meetings={meetings || []} />
              )}
            </CardContent>
          </Card>

          {/* Schedule a New Meeting */}
          <Link href="/meetings/new" className="block">
            <Card className="group border-dashed border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                  <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Schedule a New Meeting</p>
                  <p className="text-xs text-slate-500">Book a meeting, invite participants & prepare NDAs</p>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>

          {/* Documents */}
          <RecentDocumentsWidget />

          {/* Create New Document — routes to NDA templates, not meeting creation */}
          <Link href="/templates/new" className="block">
            <Card className="group border-dashed border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                  <FilePlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Create a New Document</p>
                  <p className="text-xs text-slate-500">Draft an NDA or legal document from templates</p>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
