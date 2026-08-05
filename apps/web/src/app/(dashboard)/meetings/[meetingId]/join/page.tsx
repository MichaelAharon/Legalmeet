'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Mic, Camera, Shield, Clock } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@legalmeet/ui';
import { useMeeting, useCreateRoom } from '@/hooks/useMeeting';
import { useNDASignatureStatus } from '@/hooks/useNDA';
import { SignatureStatusTracker } from '@/components/nda/SignatureStatusTracker';
import { canJoinMeeting } from '@/lib/meeting-link-access';

export default function JoinMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const { data: meeting } = useMeeting(meetingId);
  const { data: sigStatus } = useNDASignatureStatus(meetingId);
  const createRoom = useCreateRoom(meetingId);

  const allSigned = sigStatus?.allSigned || false;
  const canJoin = canJoinMeeting({ ndaRequired: meeting?.ndaRequired }, allSigned);

  const handleJoinCall = async () => {
    await createRoom.mutateAsync();
    router.push(`/call/${meetingId}`);
  };

  if (!meeting) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href={`/meetings/${meetingId}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Join: {meeting.title}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Pre-Call Checklist</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-slate-500" />
              <span>Microphone</span>
            </div>
            <Badge variant="success"><Check className="h-3 w-3 mr-1" />Ready</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-slate-500" />
              <span>Camera</span>
            </div>
            <Badge variant="success"><Check className="h-3 w-3 mr-1" />Ready</Badge>
          </div>
          {meeting.ndaRequired && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-slate-500" />
                <span>All NDA Signatures</span>
              </div>
              {allSigned ? (
                <Badge variant="success"><Check className="h-3 w-3 mr-1" />All Signed</Badge>
              ) : (
                <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature status detail */}
      {meeting.ndaRequired && (
        <Card>
          <CardHeader><CardTitle>NDA Signature Status</CardTitle></CardHeader>
          <CardContent>
            <SignatureStatusTracker meetingId={meetingId} />
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button size="lg" onClick={handleJoinCall} disabled={!canJoin || createRoom.isPending}>
          {createRoom.isPending ? 'Connecting...' : 'Join Call'}
        </Button>
        {!canJoin && (
          <p className="text-sm text-slate-500 mt-2">
            Waiting for all parties to sign the NDA before the meeting can begin.
          </p>
        )}
      </div>
    </div>
  );
}
