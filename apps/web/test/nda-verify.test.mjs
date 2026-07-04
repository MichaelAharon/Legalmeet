import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildSignatureStatus,
  canAccessMeetingByEmail,
  normalizeEmail,
  redactParticipant,
  redactSignature,
} from '../src/app/api/nda/verification.ts';

test('buildSignatureStatus separates signed and pending participants', () => {
  const participants = [
    { id: 'participant-1', ndaSignedAt: '2026-07-04T11:00:00.000Z' },
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
    { id: 'participant-1', nda_signed_at: '2026-07-04T11:00:00.000Z' },
    { id: 'participant-2', nda_signed_at: '2026-07-04T11:01:00.000Z' },
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

test('canAccessMeetingByEmail authorizes participants and host only', () => {
  const participants = [
    { id: 'participant-1', email: 'Host@Example.com' },
    { id: 'participant-2', email: 'guest@example.com' },
  ];

  assert.equal(canAccessMeetingByEmail(' host@example.com ', participants), true);
  assert.equal(canAccessMeetingByEmail('owner@example.com', participants, 'OWNER@example.com'), true);
  assert.equal(canAccessMeetingByEmail('attacker@example.com', participants, 'owner@example.com'), false);
  assert.equal(canAccessMeetingByEmail(null, participants, 'owner@example.com'), false);
});

test('normalizeEmail rejects blank and non-string values', () => {
  assert.equal(normalizeEmail(' Demo@Example.com '), 'demo@example.com');
  assert.equal(normalizeEmail('   '), null);
  assert.equal(normalizeEmail(undefined), null);
});

test('redactSignature removes signature image, NDA content, token, and request metadata', () => {
  const redacted = redactSignature({
    id: 'signature-1',
    meeting_id: 'meeting-1',
    participant_id: 'participant-1',
    template_id: 'template-1',
    nda_content_snapshot: 'full legal document',
    signature_data: 'data:image/png;base64,secret',
    signature_hash: 'hash-1',
    signer_email: 'guest@example.com',
    signer_name: 'Guest',
    signer_ip: '203.0.113.10',
    user_agent: 'browser',
    signed_at: '2026-07-04T11:00:00.000Z',
    verification_token: 'token-1',
    verified: true,
    created_at: '2026-07-04T11:00:00.000Z',
  });

  assert.deepEqual(redacted, {
    id: 'signature-1',
    meetingId: 'meeting-1',
    participantId: 'participant-1',
    templateId: 'template-1',
    signatureHash: 'hash-1',
    signerEmail: 'guest@example.com',
    signerName: 'Guest',
    signedAt: '2026-07-04T11:00:00.000Z',
    verified: true,
    createdAt: '2026-07-04T11:00:00.000Z',
  });
  assert.equal(Object.hasOwn(redacted, 'signatureData'), false);
  assert.equal(Object.hasOwn(redacted, 'ndaContentSnapshot'), false);
  assert.equal(Object.hasOwn(redacted, 'verificationToken'), false);
  assert.equal(Object.hasOwn(redacted, 'signerIp'), false);
  assert.equal(Object.hasOwn(redacted, 'userAgent'), false);
});

test('redactParticipant preserves fields required by the status UI', () => {
  assert.deepEqual(redactParticipant({
    id: 'participant-1',
    meeting_id: 'meeting-1',
    email: 'guest@example.com',
    display_name: 'Guest',
    role: 'participant',
    nda_signed_at: null,
    status: 'invited',
    created_at: '2026-07-04T11:00:00.000Z',
    user_id: 'internal-user-id',
  }), {
    id: 'participant-1',
    meetingId: 'meeting-1',
    email: 'guest@example.com',
    displayName: 'Guest',
    role: 'participant',
    ndaSignedAt: null,
    status: 'invited',
    createdAt: '2026-07-04T11:00:00.000Z',
  });
});
