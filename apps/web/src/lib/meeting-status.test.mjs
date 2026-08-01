import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  allParticipantsHaveSigned,
  resolveStatusAfterSignatures,
  resolveStatusForInviteActivation,
} from './meeting-status.ts';

describe('allParticipantsHaveSigned', () => {
  it('requires at least one participant', () => {
    assert.equal(allParticipantsHaveSigned([]), false);
  });

  it('accepts camelCase or snake_case signed timestamps', () => {
    assert.equal(
      allParticipantsHaveSigned([
        { ndaSignedAt: '2026-08-01T00:00:00.000Z' },
        { nda_signed_at: '2026-08-01T00:00:00.000Z' },
      ]),
      true,
    );
  });

  it('rejects when any participant is still pending', () => {
    assert.equal(
      allParticipantsHaveSigned([
        { ndaSignedAt: '2026-08-01T00:00:00.000Z' },
        { ndaSignedAt: null },
      ]),
      false,
    );
  });
});

describe('resolveStatusAfterSignatures', () => {
  const signedHost = [{ ndaSignedAt: '2026-08-01T00:00:00.000Z' }];

  it('promotes scheduled host-only meetings to ready after the host signs', () => {
    assert.equal(resolveStatusAfterSignatures('scheduled', signedHost), 'ready');
  });

  it('promotes awaiting_signatures meetings to ready when everyone has signed', () => {
    assert.equal(resolveStatusAfterSignatures('awaiting_signatures', signedHost), 'ready');
  });

  it('does not promote while signatures are still pending', () => {
    assert.equal(
      resolveStatusAfterSignatures('awaiting_signatures', [
        { ndaSignedAt: '2026-08-01T00:00:00.000Z' },
        { ndaSignedAt: null },
      ]),
      null,
    );
  });

  it('does not alter terminal or in-progress statuses', () => {
    assert.equal(resolveStatusAfterSignatures('in_progress', signedHost), null);
    assert.equal(resolveStatusAfterSignatures('completed', signedHost), null);
    assert.equal(resolveStatusAfterSignatures('ready', signedHost), null);
  });
});

describe('resolveStatusForInviteActivation', () => {
  const signedHost = [{ ndaSignedAt: '2026-08-01T00:00:00.000Z' }];

  it('upgrades invite activation to ready when all participants already signed', () => {
    assert.equal(
      resolveStatusForInviteActivation('awaiting_signatures', signedHost),
      'ready',
    );
  });

  it('keeps awaiting_signatures when participants remain unsigned', () => {
    assert.equal(
      resolveStatusForInviteActivation('awaiting_signatures', [
        { ndaSignedAt: '2026-08-01T00:00:00.000Z' },
        { ndaSignedAt: null },
      ]),
      'awaiting_signatures',
    );
  });

  it('leaves unrelated status updates unchanged', () => {
    assert.equal(resolveStatusForInviteActivation('cancelled', signedHost), 'cancelled');
    assert.equal(resolveStatusForInviteActivation(undefined, signedHost), undefined);
  });
});
