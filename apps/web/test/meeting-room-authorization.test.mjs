import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  authorizeRoomAccess,
  normalizeEmail,
} from '../src/app/api/meetings/[meetingId]/room/authorization.ts';

test('normalizeEmail trims and lowercases valid email strings', () => {
  assert.equal(normalizeEmail(' Host@Example.com '), 'host@example.com');
  assert.equal(normalizeEmail('   '), null);
  assert.equal(normalizeEmail(undefined), null);
});

test('authorizeRoomAccess gives meeting host an owner token identity', () => {
  const decision = authorizeRoomAccess({
    meeting: { host_id: 'profile-host' },
    participants: [
      { id: 'participant-1', user_id: 'profile-host', email: 'host@example.com', role: 'host' },
      { id: 'participant-2', user_id: 'profile-guest', email: 'guest@example.com', role: 'participant' },
    ],
    sessionEmail: 'host@example.com',
    profileId: 'profile-host',
  });

  assert.deepEqual(decision, {
    authorized: true,
    isOwner: true,
    userId: 'profile-host',
  });
});

test('authorizeRoomAccess allows participants without granting owner tokens', () => {
  const decision = authorizeRoomAccess({
    meeting: { host_id: 'profile-host' },
    participants: [
      { id: 'participant-2', user_id: null, email: 'Guest@Example.com', role: 'participant' },
    ],
    sessionEmail: 'guest@example.com',
    profileId: null,
  });

  assert.deepEqual(decision, {
    authorized: true,
    isOwner: false,
    userId: 'participant-2',
  });
});

test('authorizeRoomAccess rejects authenticated users outside the meeting', () => {
  const decision = authorizeRoomAccess({
    meeting: { host_id: 'profile-host' },
    participants: [
      { id: 'participant-2', user_id: 'profile-guest', email: 'guest@example.com', role: 'participant' },
    ],
    sessionEmail: 'attacker@example.com',
    profileId: 'profile-attacker',
  });

  assert.deepEqual(decision, {
    authorized: false,
    isOwner: false,
    userId: null,
  });
});
