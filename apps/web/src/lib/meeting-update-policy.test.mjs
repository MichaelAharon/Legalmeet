import assert from 'node:assert/strict';
import test from 'node:test';

import { buildMeetingPatch } from './meeting-update-policy.ts';

test('buildMeetingPatch allows editable meeting fields', () => {
  const result = buildMeetingPatch({
    title: 'Updated title',
    ndaCustomizedContent: 'Custom NDA',
    status: 'awaiting_signatures',
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.dbUpdates, {
    title: 'Updated title',
    nda_customized_content: 'Custom NDA',
    status: 'awaiting_signatures',
  });
  assert.deepEqual(result.mockUpdates, {
    title: 'Updated title',
    ndaCustomizedContent: 'Custom NDA',
    status: 'awaiting_signatures',
  });
});

test('buildMeetingPatch rejects client attempts to mark a meeting ready', () => {
  const result = buildMeetingPatch({ status: 'ready' });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.match(result.error, /status is managed/);
});

test('buildMeetingPatch rejects direct in-progress bypasses', () => {
  const result = buildMeetingPatch({ status: 'in_progress' });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test('buildMeetingPatch rejects client-supplied room details', () => {
  const result = buildMeetingPatch({ roomUrl: 'https://attacker.example/room' });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.match(result.error, /room details/);
});
