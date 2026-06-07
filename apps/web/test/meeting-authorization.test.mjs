import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canManageMeeting, canViewMeeting } from '../src/app/api/lib/authorization.ts';

test('meeting hosts can view and manage their meetings', () => {
  const meeting = { host_id: 'profile-host', meeting_participants: [] };

  assert.equal(canViewMeeting(meeting, 'profile-host'), true);
  assert.equal(canManageMeeting(meeting, 'profile-host'), true);
});

test('meeting participants can view but not manage meetings', () => {
  const meeting = {
    host_id: 'profile-host',
    meeting_participants: [{ user_id: 'profile-participant' }],
  };

  assert.equal(canViewMeeting(meeting, 'profile-participant'), true);
  assert.equal(canManageMeeting(meeting, 'profile-participant'), false);
});

test('unrelated profiles cannot view or manage meetings', () => {
  const meeting = {
    host_id: 'profile-host',
    meeting_participants: [{ user_id: 'profile-participant' }],
  };

  assert.equal(canViewMeeting(meeting, 'profile-other'), false);
  assert.equal(canManageMeeting(meeting, 'profile-other'), false);
});
