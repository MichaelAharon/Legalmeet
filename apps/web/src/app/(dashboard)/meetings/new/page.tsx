'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Check, FileText, PenLine, Send, Copy, Users, ChevronRight } from 'lucide-react';
import {
  Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Switch, Badge, Separator,
} from '@legalmeet/ui';
import { useCreateMeeting, useUpdateMeeting } from '@/hooks/useMeeting';
import { useProjects } from '@/hooks/useProject';
import { useNDATemplates, useSignNDA } from '@/hooks/useNDA';
import { useSubProjects } from '@/hooks/useSubProject';
import { NDAEditor } from '@/components/nda/NDAEditor';
import { SignatureCanvas } from '@/components/nda/SignatureCanvas';
import { shouldMarkNdaMeetingCreated } from '@/lib/meeting-create-success';
import { useState, useCallback, Suspense } from 'react';
import { cn } from '@/lib/utils/cn';

const STEPS = ['Meeting Details', 'Participants', 'Project', 'NDA Setup', 'Review & Sign'];

function NewMeetingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const signNDA = useSignNDA();
  const { data: projects } = useProjects();
  const { data: templates } = useNDATemplates();

  const [step, setStep] = useState(0);

  // Step 1: Meeting Details — pre-fill from query params (from calendar)
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState(searchParams.get('scheduledAt') || '');
  const [ndaRequired, setNdaRequired] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(true);

  // Step 2: Participants
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantCompany, setParticipantCompany] = useState('');
  const [participants, setParticipants] = useState<Array<{ email: string; displayName: string; company: string }>>([]);

  // Step 3: Project
  const [projectMode, setProjectMode] = useState<'existing' | 'new'>('existing');
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '');
  const [subProjectId, setSubProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Step 4: NDA Setup
  const [ndaTemplateId, setNdaTemplateId] = useState('');
  const [ndaContent, setNdaContent] = useState('');
  const [ndaPartyA, setNdaPartyA] = useState('');
  const [ndaPartyB, setNdaPartyB] = useState('');

  // Step 5: Signing
  const [agreed, setAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signingStep, setSigningStep] = useState<'review' | 'sign' | 'confirm'>('review');
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const { data: subProjects } = useSubProjects(projectId);

  // Derive party names from meeting info
  const hostName = 'Demo User'; // Current user
  const hostCompany = 'LegalMeet Inc.';
  const participantNames = participants.map(p => p.displayName).join(', ');
  const participantCompanies = [...new Set(participants.map(p => p.company).filter(Boolean))].join(', ');

  const addParticipant = () => {
    if (participantEmail && !participants.some(p => p.email === participantEmail)) {
      setParticipants([...participants, {
        email: participantEmail,
        displayName: participantName || participantEmail.split('@')[0],
        company: participantCompany,
      }]);
      setParticipantEmail('');
      setParticipantName('');
      setParticipantCompany('');
    }
  };

  // When entering step 4, auto-populate NDA party fields
  const enterNdaStep = () => {
    if (!ndaPartyA) setNdaPartyA(hostCompany || hostName);
    if (!ndaPartyB) {
      setNdaPartyB(participantCompanies || participantNames || '');
    }
    setStep(3);
  };

  const handleTemplateChange = (templateId: string) => {
    setNdaTemplateId(templateId);
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

  const selectedTemplate = templates?.find((t: any) => t.id === ndaTemplateId);

  // Auto-fill template vars from meeting info
  const getAutoFilledVars = () => {
    const vars = selectedTemplate?.templateVars || [];
    const auto: Record<string, string> = {};
    for (const v of vars) {
      const n = v.name.toLowerCase();
      if (n.includes('effective_date') || n === 'date') {
        auto[v.name] = scheduledAt ? new Date(scheduledAt).toISOString().split('T')[0] : '';
      } else if (n.includes('party_a') || n.includes('company_name') || n.includes('client_company') || n.includes('first_party')) {
        auto[v.name] = ndaPartyA;
      } else if (n.includes('party_b') || n.includes('employee_name') || n.includes('investor_name') || n.includes('vendor_name') || n.includes('second_party') || n.includes('acquiring_company') || n.includes('target_company')) {
        auto[v.name] = ndaPartyB;
      }
    }
    return auto;
  };

  const canProceed = () => {
    if (step === 0) return title.length >= 2 && scheduledAt;
    if (step === 1) return true;
    if (step === 2) return true;
    if (step === 3) {
      if (!ndaRequired) return true;
      return ndaTemplateId && ndaContent;
    }
    return true;
  };

  const handleCreateAndSign = async () => {
    if (!signatureData) return;

    // 1. Create the meeting
    const result = await createMeeting.mutateAsync({
      title,
      description,
      scheduledAt: new Date(scheduledAt).toISOString(),
      projectId: projectMode === 'new' ? null : (projectId || null),
      subProjectId: subProjectId || null,
      ndaTemplateId: ndaTemplateId === 'custom' ? null : (ndaTemplateId || null),
      ndaRequired,
      recordingEnabled,
      transcriptionEnabled,
      newProjectName: projectMode === 'new' ? newProjectName : undefined,
      newProjectDescription: projectMode === 'new' ? newProjectDescription : undefined,
      participants: participants.map(p => ({ email: p.email, displayName: p.displayName })),
    });

    // 2. Update with NDA content + host signature
    await updateMeeting.mutateAsync({
      id: result.id,
      ndaCustomizedContent: ndaContent,
      hostSignedAt: new Date().toISOString(),
      ndaTemplateId: ndaTemplateId === 'custom' ? null : ndaTemplateId,
    });

    // 3. Sign the NDA — only mark created after sign succeeds so UI cannot claim success on partial failure
    const hostParticipant = result.participants?.find((p: any) => p.role === 'host');
    await signNDA.mutateAsync({
      meetingId: result.id,
      participantId: hostParticipant?.id,
      signatureData,
      signerName: hostName,
      signerEmail: 'demo@legalmeet.com',
    });

    if (
      shouldMarkNdaMeetingCreated({
        meetingCreated: true,
        contentSaved: true,
        hostSigned: true,
      })
    ) {
      setCreatedMeetingId(result.id);
    }
    setSigningStep('confirm');
  };

  const handleSendInvites = async () => {
    if (!createdMeetingId) return;
    await updateMeeting.mutateAsync({
      id: createdMeetingId,
      status: 'awaiting_signatures',
      invitesSentAt: new Date().toISOString(),
    });
    setInviteSent(true);
  };

  const meetingLink = createdMeetingId && typeof window !== 'undefined'
    ? `${window.location.origin}/meeting-link/${createdMeetingId}`
    : '';

  const copyLink = () => {
    if (meetingLink) navigator.clipboard.writeText(meetingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/meetings"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Book a Meeting</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 flex-wrap">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            {i > 0 && <div className="h-px w-4 bg-slate-300 dark:bg-slate-600" />}
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                i === step ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' :
                i < step ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 cursor-pointer' :
                'bg-slate-100 dark:bg-slate-800 text-slate-400'
              )}
            >
              {i < step ? <Check className="h-3 w-3" /> : <span className="h-4 w-4 flex items-center justify-center text-[10px]">{i + 1}</span>}
              {label}
            </button>
          </div>
        ))}
      </div>

      {/* ====== Step 1: Meeting Details ====== */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Meeting Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Meeting Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Partnership Discussion" required />
            <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Meeting agenda..." rows={3} />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Require NDA</label>
                <Switch checked={ndaRequired} onCheckedChange={setNdaRequired} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Recording</label>
                <Switch checked={recordingEnabled} onCheckedChange={setRecordingEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Transcription</label>
                <Switch checked={transcriptionEnabled} onCheckedChange={setTranscriptionEnabled} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== Step 2: Participants ====== */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Invite Participants</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Input value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="Full name" />
              <Input value={participantEmail} onChange={e => setParticipantEmail(e.target.value)} placeholder="email@example.com" type="email" />
              <Input value={participantCompany} onChange={e => setParticipantCompany(e.target.value)} placeholder="Company (optional)" />
            </div>
            <Button type="button" variant="outline" onClick={addParticipant} disabled={!participantEmail} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Participant
            </Button>
            {participants.length > 0 ? (
              <div className="space-y-2">
                {participants.map(p => (
                  <div key={p.email} className="flex items-center justify-between p-3 rounded-md border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium">{p.displayName}</p>
                      <p className="text-xs text-slate-500">{p.email}{p.company ? ` · ${p.company}` : ''}</p>
                    </div>
                    <button onClick={() => setParticipants(participants.filter(x => x.email !== p.email))} className="text-slate-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No participants added yet. You can add them now or later.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ====== Step 3: Project ====== */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Project Association</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant={projectMode === 'existing' ? 'default' : 'outline'} size="sm" onClick={() => setProjectMode('existing')}>Existing Project</Button>
              <Button variant={projectMode === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setProjectMode('new')}>New Project</Button>
            </div>

            {projectMode === 'existing' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project</label>
                  <Select value={projectId} onValueChange={(v) => { setProjectId(v); setSubProjectId(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select a project (optional)" /></SelectTrigger>
                    <SelectContent>
                      {projects?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {projectId && subProjects?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sub-Project (optional)</label>
                    <Select value={subProjectId} onValueChange={setSubProjectId}>
                      <SelectTrigger><SelectValue placeholder="Select a sub-project" /></SelectTrigger>
                      <SelectContent>
                        {subProjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <>
                <Input label="Project Name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="e.g., Acme Corp Deal" />
                <Textarea label="Project Description" value={newProjectDescription} onChange={e => setNewProjectDescription(e.target.value)} placeholder="Brief description..." rows={2} />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ====== Step 4: NDA Setup ====== */}
      {step === 3 && !ndaRequired && (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">NDA is not required for this meeting.</p>
            <p className="text-xs text-slate-400 mt-1">You can enable it in Step 1 if needed.</p>
          </CardContent>
        </Card>
      )}

      {/* Keep NDA editor mounted on review/sign steps so Back does not remount/wipe edits */}
      {ndaRequired && step >= 3 && !createdMeetingId && (
        <div className={`space-y-6 ${step !== 3 ? 'hidden' : ''}`}>
          {/* Party Names - auto-filled from participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                NDA Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">These names will be used to fill the NDA template. Adjust if needed.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Your Name / Company (Party A)"
                  value={ndaPartyA}
                  onChange={e => setNdaPartyA(e.target.value)}
                  placeholder="e.g., LegalMeet Inc."
                />
                <Input
                  label="Other Side (Party B)"
                  value={ndaPartyB}
                  onChange={e => setNdaPartyB(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                />
              </div>
              {participants.length > 0 && (
                <div className="text-xs text-slate-400">
                  Participants: {participants.map(p => `${p.displayName}${p.company ? ` (${p.company})` : ''}`).join(', ')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Selection + Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PenLine className="h-4 w-4" />
                NDA Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Template</label>
                <Select value={ndaTemplateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger><SelectValue placeholder="Choose a template or start custom" /></SelectTrigger>
                  <SelectContent>
                    {templates?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <span>{t.name}</span>
                          {t.isDefault && <Badge variant="outline" className="text-[9px] ml-1">Default</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Write Custom NDA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                  {selectedTemplate.description || `${selectedTemplate.templateVars?.length || 0} template variables`}
                </div>
              )}

              {ndaTemplateId && (
                <NDAEditor
                  key={ndaTemplateId}
                  initialContent={ndaContent}
                  templateVars={ndaTemplateId === 'custom' ? [] : (selectedTemplate?.templateVars || [])}
                  onChange={handleNdaContentChange}
                  autoFillValues={getAutoFilledVars()}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ====== Step 5: Review & Sign ====== */}
      {step === 4 && (
        <>
          {signingStep === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review & Sign NDA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meeting summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Meeting</span>
                    <span className="text-sm font-semibold">{title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Date</span>
                    <span className="text-sm">{scheduledAt ? new Date(scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Participants</span>
                    <span className="text-sm">{participants.length > 0 ? participants.map(p => p.displayName).join(', ') : 'None'}</span>
                  </div>
                  {ndaRequired && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">NDA</span>
                      <span className="text-sm">{selectedTemplate?.name || 'Custom NDA'}</span>
                    </div>
                  )}
                </div>

                {ndaRequired && ndaContent && (
                  <>
                    <Separator />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NDA Document</p>
                    <div className="max-h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border text-sm font-mono whitespace-pre-wrap">
                      {ndaContent}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="rounded border-slate-300" />
                      <span className="text-sm">I have read and agree to this NDA as {hostName}</span>
                    </label>
                  </>
                )}

                {!ndaRequired && (
                  <p className="text-sm text-slate-500">No NDA required. Click "Create Meeting" to proceed.</p>
                )}
              </CardContent>
            </Card>
          )}

          {signingStep === 'sign' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sign the NDA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">Draw your signature below to sign as <strong>{hostName}</strong>:</p>
                <SignatureCanvas onSave={(data) => { setSignatureData(data); setSigningStep('confirm'); }} />
                <Button variant="outline" onClick={() => setSigningStep('review')}>Back to Review</Button>
              </CardContent>
            </Card>
          )}

          {signingStep === 'confirm' && signatureData && !createdMeetingId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confirm & Create Meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Signature captured</span>
                </div>
                <img src={signatureData} alt="Your signature" className="mx-auto border rounded p-2 bg-white max-h-20" />
                <p className="text-xs text-slate-500 text-center">Signer: {hostName} (demo@legalmeet.com)</p>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => { setSignatureData(null); setSigningStep('sign'); }}>Re-sign</Button>
                  <Button onClick={handleCreateAndSign} disabled={createMeeting.isPending || updateMeeting.isPending || signNDA.isPending}>
                    {(createMeeting.isPending || updateMeeting.isPending || signNDA.isPending) ? 'Creating...' : 'Create Meeting & Sign NDA'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* After creation — send invites */}
          {createdMeetingId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600 text-base">
                  <Check className="h-5 w-5" />
                  Meeting Created & NDA Signed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">
                  Share the meeting link with participants. They will need to sign the NDA before the meeting can begin.
                </p>

                {/* Copyable link */}
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={meetingLink}
                    className="flex-1 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={copyLink}>
                    {linkCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Participant list */}
                {participants.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invite will be sent to:</p>
                    {participants.map(p => (
                      <div key={p.email} className="flex items-center gap-2 text-sm p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                          {p.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{p.displayName}</span>
                        <span className="text-slate-400 text-xs">{p.email}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {!inviteSent ? (
                    <Button onClick={handleSendInvites} disabled={updateMeeting.isPending}>
                      <Send className="h-4 w-4 mr-2" />
                      {updateMeeting.isPending ? 'Sending...' : 'Send Invites & Activate'}
                    </Button>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-3 py-1.5">
                      <Check className="h-3.5 w-3.5 mr-1.5" /> Invites Sent
                    </Badge>
                  )}
                  <Button variant="outline" asChild>
                    <Link href={`/meetings/${createdMeetingId}`}>View Meeting</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Spacer for fixed bottom bar */}
      <div className="h-20" />

      {/* Navigation buttons — fixed to viewport bottom */}
      {!createdMeetingId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between z-50">
          <div>
            {step > 0 && signingStep === 'review' && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link href="/meetings">Cancel</Link></Button>
            {step < 3 ? (
              <Button onClick={() => step === 2 ? enterNdaStep() : setStep(step + 1)} disabled={!canProceed()}>
                Next
              </Button>
            ) : step === 3 ? (
              <Button onClick={() => { setStep(4); setSigningStep('review'); }} disabled={!canProceed()}>
                {ndaRequired ? 'Proceed to Sign' : 'Review & Create'}
              </Button>
            ) : step === 4 && signingStep === 'review' && ndaRequired ? (
              <Button onClick={() => setSigningStep('sign')} disabled={!agreed}>
                Sign NDA <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : step === 4 && !ndaRequired && signingStep === 'review' ? (
              <Button onClick={async () => {
                const result = await createMeeting.mutateAsync({
                  title, description,
                  scheduledAt: new Date(scheduledAt).toISOString(),
                  projectId: projectMode === 'new' ? null : (projectId || null),
                  subProjectId: subProjectId || null,
                  ndaRequired: false, recordingEnabled, transcriptionEnabled,
                  newProjectName: projectMode === 'new' ? newProjectName : undefined,
                  newProjectDescription: projectMode === 'new' ? newProjectDescription : undefined,
                  participants: participants.map(p => ({ email: p.email, displayName: p.displayName })),
                });
                setCreatedMeetingId(result.id);
              }} disabled={createMeeting.isPending}>
                {createMeeting.isPending ? 'Creating...' : 'Create Meeting'}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewMeetingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewMeetingForm />
    </Suspense>
  );
}
