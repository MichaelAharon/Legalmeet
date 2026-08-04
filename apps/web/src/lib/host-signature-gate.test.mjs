import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hostParticipantHasSigned,
  isHostNdaPrepareComplete,
} from './host-signature-gate.ts';

test('hostParticipantHasSigned is false when only hostSignedAt-equivalent metadata exists', () => {
  // Meeting-level hostSignedAt is intentionally ignored; only participant rows count.
  assert.equal(
    hostParticipantHasSigned([
      { role: 'host', ndaSignedAt: null },
      { role: 'participant', ndaSignedAt: '2026-08-04T00:00:00.000Z' },
    ]),
    false,
  );
});

test('hostParticipantHasSigned is true only when the host participant has ndaSignedAt', () => {
  assert.equal(
    hostParticipantHasSigned([
      { role: 'host', ndaSignedAt: '2026-08-04T00:00:00.000Z' },
      { role: 'participant', ndaSignedAt: null },
    ]),
    true,
  );
});

test('isHostNdaPrepareComplete stays open when awaiting_signatures was set without a host signature', () => {
  // Premature status/hostSignedAt must not lock prepare.
  assert.equal(
    isHostNdaPrepareComplete([{ role: 'host', ndaSignedAt: null }]),
    false,
  );
});

test('isHostNdaPrepareComplete locks after the host actually signs', () => {
  assert.equal(
    isHostNdaPrepareComplete([{ role: 'host', nda_signed_at: '2026-08-04T00:00:00.000Z' }]),
    true,
  );
});

test('hostParticipantHasSigned is false with empty or missing host rows', () => {
  assert.equal(hostParticipantHasSigned([]), false);
  assert.equal(hostParticipantHasSigned(null), false);
  assert.equal(
    hostParticipantHasSigned([{ role: 'participant', ndaSignedAt: '2026-08-04T00:00:00.000Z' }]),
    false,
  );
});
