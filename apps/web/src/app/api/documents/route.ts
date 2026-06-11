import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../lib/db';
import { getAccessibleMeetingIds, requireApiUser } from '../lib/auth';
import { mockSignatures, mockRecordings, mockTranscripts, mockBundles, mockMeetings } from '../lib/mock-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const subProjectId = searchParams.get('subProjectId');
  const meetingId = searchParams.get('meetingId');

  if (useMock()) {
    let meetingIds: string[] = [];
    if (meetingId) {
      meetingIds = [meetingId];
    } else if (subProjectId) {
      meetingIds = mockMeetings.filter(m => m.subProjectId === subProjectId).map(m => m.id);
    } else if (projectId) {
      meetingIds = mockMeetings.filter(m => m.projectId === projectId).map(m => m.id);
    }

    const documents: any[] = [];
    for (const sig of mockSignatures.filter(s => meetingIds.includes(s.meetingId))) {
      const meeting = mockMeetings.find(m => m.id === sig.meetingId);
      documents.push({
        id: sig.id, type: 'nda', name: `NDA - ${sig.signerName}`,
        meetingId: sig.meetingId, meetingTitle: meeting?.title || 'Unknown',
        date: sig.signedAt, metadata: { signerEmail: sig.signerEmail, verified: sig.verified },
      });
    }
    for (const rec of mockRecordings.filter(r => meetingIds.includes(r.meetingId))) {
      const meeting = mockMeetings.find(m => m.id === rec.meetingId);
      documents.push({
        id: rec.id, type: 'recording', name: `Recording - ${meeting?.title || 'Unknown'}`,
        meetingId: rec.meetingId, meetingTitle: meeting?.title || 'Unknown',
        date: rec.createdAt, metadata: { duration: rec.durationSeconds, fileSize: rec.fileSizeBytes, status: rec.status },
      });
    }
    for (const trans of mockTranscripts.filter(t => meetingIds.includes(t.meetingId))) {
      const meeting = mockMeetings.find(m => m.id === trans.meetingId);
      documents.push({
        id: trans.id, type: 'transcript', name: `Transcript - ${meeting?.title || 'Unknown'}`,
        meetingId: trans.meetingId, meetingTitle: meeting?.title || 'Unknown',
        date: trans.createdAt, metadata: { wordCount: trans.wordCount, language: trans.language, status: trans.status },
      });
    }
    for (const bundle of mockBundles.filter(b => meetingIds.includes(b.meetingId))) {
      const meeting = mockMeetings.find(m => m.id === bundle.meetingId);
      documents.push({
        id: bundle.id, type: 'bundle', name: `Bundle - ${meeting?.title || 'Unknown'}`,
        meetingId: bundle.meetingId, meetingTitle: meeting?.title || 'Unknown',
        date: bundle.generatedAt || bundle.createdAt,
        metadata: { includesNda: bundle.includesNda, includesRecording: bundle.includesRecording, includesTranscript: bundle.includesTranscript },
      });
    }
    return NextResponse.json(documents);
  }

  // --- Real Supabase ---
  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;

  // Get relevant meeting IDs, limited to meetings visible to the current profile.
  const accessibleMeetingIds = await getAccessibleMeetingIds(db, auth.user.id);
  if (!accessibleMeetingIds.length) return NextResponse.json([]);

  let meetingIds = [...accessibleMeetingIds];
  if (meetingId) {
    meetingIds = accessibleMeetingIds.includes(meetingId) ? [meetingId] : [];
  } else if (subProjectId || projectId) {
    let meetingQuery = db.from('meetings').select('id').in('id', accessibleMeetingIds);
    if (subProjectId) meetingQuery = meetingQuery.eq('sub_project_id', subProjectId);
    else if (projectId) meetingQuery = meetingQuery.eq('project_id', projectId);
    const { data: meetings, error: meetingsError } = await meetingQuery;
    if (meetingsError) return NextResponse.json({ error: meetingsError.message }, { status: 500 });
    meetingIds = (meetings || []).map((m: any) => m.id);
  }

  if (!meetingIds.length) return NextResponse.json([]);

  const [sigs, recs, trans, bundles, meetings] = await Promise.all([
    db.from('nda_signatures').select('*').in('meeting_id', meetingIds),
    db.from('recordings').select('*').in('meeting_id', meetingIds),
    db.from('transcripts').select('*').in('meeting_id', meetingIds),
    db.from('document_bundles').select('*').in('meeting_id', meetingIds),
    db.from('meetings').select('id, title').in('id', meetingIds),
  ]);

  const meetingMap = new Map((meetings.data || []).map((m: any) => [m.id, m.title]));
  const documents: any[] = [];

  for (const sig of sigs.data || []) {
    documents.push({
      id: sig.id, type: 'nda', name: `NDA - ${sig.signer_name}`,
      meetingId: sig.meeting_id, meetingTitle: meetingMap.get(sig.meeting_id) || 'Unknown',
      date: sig.signed_at, metadata: { signerEmail: sig.signer_email, verified: sig.verified },
    });
  }
  for (const rec of recs.data || []) {
    documents.push({
      id: rec.id, type: 'recording', name: `Recording - ${meetingMap.get(rec.meeting_id) || 'Unknown'}`,
      meetingId: rec.meeting_id, meetingTitle: meetingMap.get(rec.meeting_id) || 'Unknown',
      date: rec.created_at, metadata: { duration: rec.duration_seconds, fileSize: rec.file_size_bytes, status: rec.status },
    });
  }
  for (const t of trans.data || []) {
    documents.push({
      id: t.id, type: 'transcript', name: `Transcript - ${meetingMap.get(t.meeting_id) || 'Unknown'}`,
      meetingId: t.meeting_id, meetingTitle: meetingMap.get(t.meeting_id) || 'Unknown',
      date: t.created_at, metadata: { wordCount: t.word_count, language: t.language, status: t.status },
    });
  }
  for (const b of bundles.data || []) {
    documents.push({
      id: b.id, type: 'bundle', name: `Bundle - ${meetingMap.get(b.meeting_id) || 'Unknown'}`,
      meetingId: b.meeting_id, meetingTitle: meetingMap.get(b.meeting_id) || 'Unknown',
      date: b.generated_at || b.created_at,
      metadata: { includesNda: b.includes_nda, includesRecording: b.includes_recording, includesTranscript: b.includes_transcript },
    });
  }

  return NextResponse.json(documents);
}
