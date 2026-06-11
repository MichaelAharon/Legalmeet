import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../lib/db';
import { canAccessProject, getAccessibleMeetingIds, requireApiUser } from '../lib/auth';
import { mockMeetings, mockParticipants, mockProjects } from '../lib/mock-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const status = searchParams.get('status');

  if (useMock()) {
    let filtered = [...mockMeetings];
    if (projectId) filtered = filtered.filter(m => m.projectId === projectId);
    if (status) filtered = filtered.filter(m => m.status === status);
    const withParticipants = filtered.map(m => ({
      ...m,
      participants: mockParticipants.filter(p => p.meetingId === m.id),
    }));
    return NextResponse.json(withParticipants);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;

  const accessibleMeetingIds = await getAccessibleMeetingIds(db, auth.user.id);
  if (!accessibleMeetingIds.length) return NextResponse.json([]);

  let query = db.from('meetings').select('*, meeting_participants(*)').in('id', accessibleMeetingIds);
  if (projectId) query = query.eq('project_id', projectId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = data.map((m: any) => {
    const { meeting_participants, ...meeting } = m;
    return {
      ...toCamel(meeting),
      participants: (meeting_participants || []).map(toCamel),
    };
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    if (useMock()) {
      let projectId = body.projectId || null;
      if (body.newProjectName) {
        const newProject = {
          id: crypto.randomUUID(),
          ownerId: 'mock-user-001',
          name: body.newProjectName,
          description: body.newProjectDescription || null,
          status: 'active',
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockProjects.push(newProject);
        projectId = newProject.id;
      }
      const meeting = {
        id: crypto.randomUUID(),
        projectId,
        subProjectId: body.subProjectId || null,
        hostId: 'mock-user-001',
        title: body.title,
        description: body.description || null,
        scheduledAt: body.scheduledAt || new Date().toISOString(),
        startedAt: null, endedAt: null, durationSeconds: null,
        status: 'scheduled',
        roomName: null, roomUrl: null,
        ndaTemplateId: body.ndaTemplateId || null,
        ndaRequired: body.ndaRequired ?? true,
        ndaCustomizedContent: null,
        hostSignedAt: null,
        invitesSentAt: null,
        recordingEnabled: body.recordingEnabled ?? true,
        transcriptionEnabled: body.transcriptionEnabled ?? true,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockMeetings.push(meeting);
      mockParticipants.push({
        id: crypto.randomUUID(), meetingId: meeting.id, userId: 'mock-user-001',
        email: 'demo@legalmeet.com', displayName: 'Demo User', role: 'host',
        joinedAt: null, leftAt: null, ndaSignedAt: null,
        status: 'invited', createdAt: new Date().toISOString(),
      });
      if (body.participants) {
        for (const p of body.participants) {
          mockParticipants.push({
            id: crypto.randomUUID(), meetingId: meeting.id, userId: null,
            email: p.email, displayName: p.displayName || null, role: p.role || 'participant',
            joinedAt: null, leftAt: null, ndaSignedAt: null,
            status: 'invited', createdAt: new Date().toISOString(),
          });
        }
      }
      return NextResponse.json(meeting, { status: 201 });
    }

    const db = getDb();
    const auth = await requireApiUser(db);
    if (auth.response) return auth.response;

    // Create project inline if requested
    let projectId = body.projectId || null;
    if (body.newProjectName) {
      const { data: proj, error: projError } = await db.from('projects').insert({
        owner_id: auth.user.id,
        name: body.newProjectName,
        description: body.newProjectDescription || null,
      }).select().single();
      if (projError) return NextResponse.json({ error: projError.message }, { status: 500 });
      projectId = proj?.id || null;
    } else if (projectId && !(await canAccessProject(db, auth.user.id, projectId))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let subProjectId = body.subProjectId || null;
    if (subProjectId) {
      const { data: subProject, error: subProjectError } = await db.from('sub_projects')
        .select('id, project_id').eq('id', subProjectId).maybeSingle();
      if (subProjectError) return NextResponse.json({ error: subProjectError.message }, { status: 500 });
      if (!subProject || !(await canAccessProject(db, auth.user.id, subProject.project_id))) {
        return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
      }
      if (projectId && subProject.project_id !== projectId) {
        return NextResponse.json({ error: 'Sub-project does not belong to project' }, { status: 400 });
      }
      projectId = projectId || subProject.project_id;
    }

    const { data: meeting, error } = await db.from('meetings').insert({
      project_id: projectId,
      sub_project_id: subProjectId,
      host_id: auth.user.id,
      title: body.title,
      description: body.description || null,
      scheduled_at: body.scheduledAt || new Date().toISOString(),
      nda_template_id: body.ndaTemplateId || null,
      nda_required: body.ndaRequired ?? true,
      recording_enabled: body.recordingEnabled ?? true,
      transcription_enabled: body.transcriptionEnabled ?? true,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add host as participant
    await db.from('meeting_participants').insert({
      meeting_id: meeting.id,
      user_id: auth.user.id,
      email: auth.user.email,
      display_name: auth.user.name || auth.user.email,
      role: 'host',
    });

    // Add invited participants
    if (body.participants?.length) {
      await db.from('meeting_participants').insert(
        body.participants.map((p: any) => ({
          meeting_id: meeting.id,
          email: p.email,
          display_name: p.displayName || null,
          role: p.role || 'participant',
        }))
      );
    }

    return NextResponse.json(toCamel(meeting), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
