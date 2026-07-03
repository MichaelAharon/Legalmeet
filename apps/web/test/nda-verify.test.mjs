import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildSignatureStatus } from '../src/app/api/nda/verification.ts';

test('buildSignatureStatus separates signed and pending participants', () => {
  const participants = [
    { id: 'participant-1', ndaSignedAt: '2026-07-03T11:00:00.000Z' },
    { id: 'participant-2', ndaSignedAt: null },
  ];
  const signatures = [{ id: 'signature-1', participantId: 'participant-1' }];

  const status = buildSignatureStatus(participants, signatures);

  assert.equal(status.allSigned, false);
  assert.deepEqual(status.signed.map((participant) => participant.id), ['participant-1']);
  assert.deepEqual(status.pending.map((participant) => participant.id), ['participant-2']);
  assert.equal(status.signatures, signatures);
});

test('buildSignatureStatus supports snake_case production rows', () => {
  const participants = [
    { id: 'participant-1', nda_signed_at: '2026-07-03T11:00:00.000Z' },
    { id: 'participant-2', nda_signed_at: '2026-07-03T11:01:00.000Z' },
  ];

  const status = buildSignatureStatus(participants, []);

  assert.equal(status.allSigned, true);
  assert.deepEqual(status.pending, []);
  assert.deepEqual(status.signed.map((participant) => participant.id), ['participant-1', 'participant-2']);
});

test('buildSignatureStatus does not mark meetings with no participants complete', () => {
  const status = buildSignatureStatus([], []);

  assert.equal(status.allSigned, false);
  assert.deepEqual(status.signed, []);
  assert.deepEqual(status.pending, []);
});
