'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, FileText, Video } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@legalmeet/ui';
import { useMeeting } from '@/hooks/useMeeting';
import { useNDASignatureStatus, useNDATemplate } from '@/hooks/useNDA';
import { NDASigningFlow } from '@/components/nda/NDASigningFlow';
import { SignatureStatusTracker } from '@/components/nda/SignatureStatusTracker';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { resolveMeetingNdaContent } from '@/lib/resolve-meeting-nda-content';

export default function MeetingLinkPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const { data: meeting, isLoading: meetingLoading } = useMeeting(meetingId);
  const { data: sigStatus, isLoading: sigLoading } = useNDASignatureStatus(meetingId);
  const needsTemplate = !!meeting && !meeting.ndaCustomizedContent && !!meeting.ndaTemplateId;
  const { data: template, isLoading: templateLoading } = useNDATemplate(meeting?.ndaTemplateId || '');

  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [showSigning, setShowSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  if (meetingLoading || sigLoading || (needsTemplate && templateLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Meeting not found or link is invalid.</p>
      </div>
    );
  }

  const participants = meeting.participants || [];
  const unsignedParticipants = participants.filter((p: any) => !p.ndaSignedAt && p.role !== 'host');
  const selectedParticipant = participants.find((p: any) => p.id === selectedParticipantId);
  const allSigned = sigStatus?.allSigned || false;
  // Match /api/nda/sign and /api/guest: customized content, else live template body.
  const ndaContent = resolveMeetingNdaContent(meeting.ndaCustomizedContent, template?.content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indigo-600 mb-1">LegalMeet</h1>
          <p className="text-sm text-slate-500">You&apos;ve been invited to a meeting</p>
        </div>

        {/* Meeting Details */}
        <Card>
          <CardHeader>
            <CardTitle>{meeting.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meeting.description && <p className="text-sm text-slate-600 dark:text-slate-400">{meeting.description}</p>}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date(meeting.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{participants.length} participants</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Host:</span>
              <span className="text-sm font-medium">{participants.find((p: any) => p.role === 'host')?.displayName || 'Unknown'}</span>
            </div>
          </CardContent>
        </Card>

        {/* NDA Document */}
        {ndaContent ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> NDA / Binding Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border text-sm font-mono whitespace-pre-wrap">
                {ndaContent}
              </div>
            </CardContent>
          </Card>
        ) : meeting.ndaRequired ? (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-sm text-slate-500">
                NDA content is not available for this meeting yet. Ask the host to prepare the agreement before signing.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Signature Status */}
        <Card>
          <CardHeader>
            <CardTitle>Signature Status</CardTitle>
          </CardHeader>
          <CardContent>
            <SignatureStatusTracker meetingId={meetingId} />
          </CardContent>
        </Card>

        {/* Sign NDA — only when the same text the API will snapshot is available */}
        {!allSigned && !signed && unsignedParticipants.length > 0 && !!ndaContent && (
          <Card>
            <CardHeader>
              <CardTitle>Sign the NDA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showSigning ? (
                <>
                  <p className="text-sm text-slate-500">Select your name to sign the NDA:</p>
                  <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
                    <SelectTrigger><SelectValue placeholder="Select your name" /></SelectTrigger>
                    <SelectContent>
                      {unsignedParticipants.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.displayName || p.email} ({p.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedParticipantId && (
                    <Button onClick={() => setShowSigning(true)}>
                      Review & Sign NDA
                    </Button>
                  )}
                </>
              ) : (
                <NDASigningFlow
                  meetingId={meetingId}
                  templateContent={ndaContent}
                  templateName="Meeting NDA"
                  participantId={selectedParticipantId}
                  signerName={selectedParticipant?.displayName || 'Participant'}
                  signerEmail={selectedParticipant?.email || ''}
                  onComplete={() => {
                    setSigned(true);
                    setShowSigning(false);
                  }}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Signed confirmation */}
        {signed && !allSigned && (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-emerald-600 font-medium">You have signed the NDA.</p>
              <p className="text-sm text-slate-500 mt-1">Waiting for other participants to sign before the meeting can begin.</p>
            </CardContent>
          </Card>
        )}

        {/* All signed - Join meeting */}
        {allSigned && (
          <Card>
            <CardContent className="py-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Video className="h-6 w-6" />
                <span className="text-lg font-semibold">All parties have signed — Meeting is ready!</span>
              </div>
              <Button size="lg" asChild>
                <Link href={`/meetings/${meetingId}/join`}>Join Meeting</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
