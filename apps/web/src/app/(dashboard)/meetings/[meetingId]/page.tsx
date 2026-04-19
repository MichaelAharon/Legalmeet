'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Video, FileText, Download, MessageSquare, Copy, Check, Send, Edit } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Separator } from '@legalmeet/ui';
import { useMeeting } from '@/hooks/useMeeting';
import { SignatureStatusTracker } from '@/components/nda/SignatureStatusTracker';
import { formatDisplay } from '@/lib/utils/dates';

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const { data: meeting, isLoading } = useMeeting(meetingId);
  const [linkCopied, setLinkCopied] = useState(false);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>;
  if (!meeting) return <div>Meeting not found</div>;

  const statusMap: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
    scheduled: 'default', awaiting_signatures: 'warning', ready: 'success',
    in_progress: 'warning', completed: 'success', cancelled: 'error',
  };
  const statusColor = statusMap[meeting.status as string] ?? 'default';
  const meetingLink = typeof window !== 'undefined' ? `${window.location.origin}/meeting-link/${meetingId}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/meetings"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <Badge variant={statusColor}>{(meeting.status as string).replace(/_/g, ' ')}</Badge>
          </div>
          <p className="text-slate-500 text-sm">{formatDisplay(meeting.scheduledAt || meeting.createdAt)}</p>
        </div>
      </div>

      {/* Status-specific actions */}
      {meeting.status === 'scheduled' && !meeting.hostSignedAt && (
        <Card>
          <CardContent className="py-6 text-center">
            <Edit className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Prepare Documents</h2>
            <p className="text-slate-500 text-sm mb-4">
              Customize the NDA and sign it before sending invites to participants.
            </p>
            <Button asChild size="lg">
              <Link href={`/meetings/${meetingId}/prepare`}>
                <FileText className="h-4 w-4 mr-2" />Prepare & Sign NDA
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {(meeting.status === 'awaiting_signatures' || (meeting.status === 'scheduled' && meeting.hostSignedAt)) && (
        <Card>
          <CardContent className="py-6 space-y-4">
            <div className="text-center">
              <Send className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold mb-1">Waiting for Signatures</h2>
              <p className="text-slate-500 text-sm mb-3">Share the meeting link with participants so they can sign the NDA.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly value={meetingLink}
                className="flex-1 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
              <Button variant="outline" onClick={copyLink}>
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {meeting.status === 'ready' && (
        <Card>
          <CardContent className="py-6 text-center">
            <Video className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">All Parties Signed — Ready to Join!</h2>
            <Button asChild size="lg">
              <Link href={`/meetings/${meetingId}/join`}>
                <Video className="h-4 w-4 mr-2" />Join Meeting
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {(meeting.status === 'completed' || meeting.status === 'in_progress') && (
        <div className="space-y-4">
          <Card>
            <CardContent className="py-6 text-center">
              <Video className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                {meeting.status === 'in_progress' ? 'Meeting In Progress' : 'Meeting Completed'}
              </h2>
              <div className="flex gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href={`/call/${meetingId}`}>
                    <Video className="h-4 w-4 mr-2" />{meeting.status === 'in_progress' ? 'Rejoin Call' : 'Start New Call'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <h2 className="text-lg font-semibold">Meeting Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="py-4 text-center">
                <FileText className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Signed NDA</p>
                <Button variant="outline" size="sm" className="mt-2"><Download className="h-3 w-3 mr-1" />Download</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <Video className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Recording</p>
                <Button variant="outline" size="sm" className="mt-2"><Download className="h-3 w-3 mr-1" />Download</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <MessageSquare className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Transcript</p>
                <Button variant="outline" size="sm" className="mt-2"><Download className="h-3 w-3 mr-1" />Download</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Signature status */}
      {meeting.ndaRequired && (
        <Card>
          <CardHeader><CardTitle className="text-base">NDA Signature Status</CardTitle></CardHeader>
          <CardContent>
            <SignatureStatusTracker meetingId={meetingId} />
          </CardContent>
        </Card>
      )}

      {/* Meeting details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Meeting Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Description</span><span>{meeting.description || 'None'}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-slate-500">NDA Required</span><span>{meeting.ndaRequired ? 'Yes' : 'No'}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-slate-500">Host Signed</span><span>{meeting.hostSignedAt ? formatDisplay(meeting.hostSignedAt) : 'Not yet'}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-slate-500">Recording</span><span>{meeting.recordingEnabled ? 'Enabled' : 'Disabled'}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-slate-500">Transcription</span><span>{meeting.transcriptionEnabled ? 'Enabled' : 'Disabled'}</span></div>

          {/* Participants list */}
          {meeting.participants?.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-slate-500 mb-2">Participants ({meeting.participants.length})</p>
                <div className="space-y-1">
                  {meeting.participants.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between py-1">
                      <span>{p.displayName || p.email} <span className="text-slate-400">({p.role})</span></span>
                      <span className={p.ndaSignedAt ? 'text-emerald-500 text-xs' : 'text-slate-400 text-xs'}>
                        {p.ndaSignedAt ? 'Signed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
