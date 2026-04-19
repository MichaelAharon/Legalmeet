'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Copy, Check, FileText, Users } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge } from '@legalmeet/ui';
import { useMeeting, useUpdateMeeting } from '@/hooks/useMeeting';
import { useNDATemplates } from '@/hooks/useNDA';
import { NDAEditor } from '@/components/nda/NDAEditor';
import { NDASigningFlow } from '@/components/nda/NDASigningFlow';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function PrepareMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const { data: meeting, isLoading } = useMeeting(meetingId);
  const { data: templates } = useNDATemplates();
  const updateMeeting = useUpdateMeeting();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [ndaContent, setNdaContent] = useState('');
  const [showSigning, setShowSigning] = useState(false);
  const [hostSigned, setHostSigned] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const selectedTemplate = templates?.find((t: any) => t.id === selectedTemplateId);
  const meetingLink = typeof window !== 'undefined' ? `${window.location.origin}/meeting-link/${meetingId}` : '';

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'custom') {
      setNdaContent('');
    } else {
      const tmpl = templates?.find((t: any) => t.id === templateId);
      if (tmpl) setNdaContent(tmpl.content);
    }
  };

  const handleNdaContentChange = useCallback((content: string) => {
    setNdaContent(content);
  }, []);

  const handleSigningComplete = async () => {
    setHostSigned(true);
    setShowSigning(false);
    // Update meeting with customized NDA content and host signature
    await updateMeeting.mutateAsync({
      id: meetingId,
      ndaCustomizedContent: ndaContent,
      hostSignedAt: new Date().toISOString(),
      ndaTemplateId: selectedTemplateId === 'custom' ? null : selectedTemplateId,
    });
  };

  const handleSendInvites = async () => {
    await updateMeeting.mutateAsync({
      id: meetingId,
      status: 'awaiting_signatures',
      invitesSentAt: new Date().toISOString(),
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (!meeting) return <p>Meeting not found.</p>;

  const isAlreadyPrepared = meeting.hostSignedAt || meeting.status === 'awaiting_signatures';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href={`/meetings/${meetingId}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">Prepare Documents</h1>
          <p className="text-slate-500 dark:text-slate-400">{meeting.title}</p>
        </div>
      </div>

      {/* Meeting info summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-slate-500">Scheduled</p>
                <p className="font-medium">{new Date(meeting.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {meeting.participants && (
                <div>
                  <p className="text-sm text-slate-500">Participants</p>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{meeting.participants.length}</span>
                  </div>
                </div>
              )}
            </div>
            <Badge variant={meeting.status === 'awaiting_signatures' ? 'warning' : meeting.status === 'ready' ? 'success' : 'default'}>
              {meeting.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Already prepared? */}
      {isAlreadyPrepared ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-600">
              <Check className="h-5 w-5" /> Documents Prepared & Signed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">You have already signed the NDA. Share the meeting link with participants so they can sign and join.</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={meetingLink}
                className="flex-1 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
              <Button variant="outline" onClick={copyLink}>
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button asChild><Link href={`/meetings/${meetingId}`}>View Meeting Details</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Step 1: NDA Setup */}
          {!showSigning && !hostSigned && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Customize NDA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Template</label>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger><SelectValue placeholder="Choose a template or start custom" /></SelectTrigger>
                      <SelectContent>
                        {templates?.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        <SelectItem value="custom">Custom / Blank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedTemplateId) && (
                    <NDAEditor
                      initialContent={selectedTemplateId === 'custom' ? '' : (selectedTemplate?.content || '')}
                      templateVars={selectedTemplateId === 'custom' ? [] : (selectedTemplate?.templateVars || [])}
                      onChange={handleNdaContentChange}
                    />
                  )}
                </CardContent>
              </Card>

              {selectedTemplateId && ndaContent && (
                <div className="flex justify-end">
                  <Button onClick={() => setShowSigning(true)}>
                    Proceed to Sign
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Step 2: Host signing */}
          {showSigning && !hostSigned && (
            <div>
              <NDASigningFlow
                meetingId={meetingId}
                templateContent={ndaContent}
                templateName={selectedTemplate?.name || 'Custom NDA'}
                participantId={meeting.participants?.find((p: any) => p.role === 'host')?.id}
                onComplete={handleSigningComplete}
              />
              <div className="mt-4">
                <Button variant="outline" onClick={() => setShowSigning(false)}>Back to Editor</Button>
              </div>
            </div>
          )}

          {/* Step 3: Send invites */}
          {hostSigned && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <Check className="h-5 w-5" /> NDA Signed Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">Share the meeting link with participants. They will need to sign the NDA before the meeting can begin.</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={meetingLink}
                    className="flex-1 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                  <Button variant="outline" onClick={copyLink}>
                    {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSendInvites} disabled={updateMeeting.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    {updateMeeting.isPending ? 'Sending...' : 'Send Invites & Activate'}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/meetings/${meetingId}`}>View Meeting</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
