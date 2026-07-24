import assert from 'node:assert/strict';
import test from 'node:test';

import { canCreateMeetingRoom } from './meeting-readiness.ts';

test('canCreateMeetingRoom allows meetings that do not require an NDA', () => {
  assert.equal(canCreateMeetingRoom(false, []), true);
});

test('canCreateMeetingRoom blocks NDA meetings with pending signatures', () => {
  const participants = [
    { ndaSignedAt: '2026-07-07T00:00:00.000Z' },
    { ndaSignedAt: null },
  ];

  assert.equal(canCreateMeetingRoom(true, participants), false);
});

test('canCreateMeetingRoom allows NDA meetings only after every participant signed', () => {
  const participants = [
    { ndaSignedAt: '2026-07-07T00:00:00.000Z' },
    { ndaSignedAt: '2026-07-07T00:01:00.000Z' },
  ];

  assert.equal(canCreateMeetingRoom(true, participants), true);
});

test('canCreateMeetingRoom treats empty NDA participant lists as not ready', () => {
  assert.equal(canCreateMeetingRoom(true, []), false);
});
