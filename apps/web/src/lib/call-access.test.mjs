import assert from 'node:assert/strict';
import test from 'node:test';

import { getCallAccessState } from './call-access.js';

test('allows calls for meetings that do not require an NDA', () => {
  assert.equal(
    getCallAccessState({ meeting: { ndaRequired: false } }),
    'allowed',
  );
});

test('allows NDA-required calls only after every signature is complete', () => {
  assert.equal(
    getCallAccessState({
      meeting: { ndaRequired: true },
      signatureStatus: { allSigned: true },
    }),
    'allowed',
  );
});

test('blocks NDA-required calls while signatures are pending', () => {
  assert.equal(
    getCallAccessState({
      meeting: { ndaRequired: true },
      signatureStatus: { allSigned: false },
    }),
    'blocked',
  );
});

test('fails closed when NDA signature verification errors', () => {
  assert.equal(
    getCallAccessState({
      meeting: { ndaRequired: true },
      signatureError: true,
    }),
    'blocked',
  );
});

test('keeps checking until meeting and required signature status load', () => {
  assert.equal(
    getCallAccessState({ meetingLoading: true }),
    'checking',
  );
  assert.equal(
    getCallAccessState({
      meeting: { ndaRequired: true },
      signatureLoading: true,
    }),
    'checking',
  );
});
