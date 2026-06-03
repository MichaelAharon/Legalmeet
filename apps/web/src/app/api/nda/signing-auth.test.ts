import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeMockSignature } from './signing-auth';

test('rejects participant NDA signatures without the participant invitation token', () => {
  const result = authorizeMockSignature({
    meetingId: 'meet-002',
    participantId: 'part-004',
    signerEmail: 'sarah@acme.com',
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 403);
    assert.match(result.error, /Guest token is required/);
  }
});

test('rejects participant NDA signatures with a token for another participant', () => {
  const result = authorizeMockSignature({
    meetingId: 'meet-002',
    participantId: 'part-004',
    signerEmail: 'sarah@acme.com',
    guestToken: 'guest-token-tanaka-001',
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 403);
    assert.match(result.error, /not authorized/);
  }
});

test('rejects a token request when the submitted signer email does not match the participant', () => {
  const result = authorizeMockSignature({
    meetingId: 'meet-002',
    participantId: 'part-004',
    signerEmail: 'attacker@example.com',
    guestToken: 'guest-token-sarah-001',
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 403);
    assert.match(result.error, /Signer identity/);
  }
});

test('accepts the invitation token issued for that participant and meeting', () => {
  const result = authorizeMockSignature({
    meetingId: 'meet-002',
    participantId: 'part-004',
    signerEmail: 'sarah@acme.com',
    guestToken: 'guest-token-sarah-001',
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.participant.id, 'part-004');
    assert.equal(result.guestToken.token, 'guest-token-sarah-001');
  }
});
