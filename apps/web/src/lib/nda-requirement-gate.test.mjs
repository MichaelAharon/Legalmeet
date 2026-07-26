import assert from 'node:assert/strict';
import test from 'node:test';
import { getNdaRequirementDisableRejection } from './nda-requirement-gate.ts';

test('allows omitting ndaRequired from a patch', () => {
  assert.equal(getNdaRequirementDisableRejection(true, undefined), null);
});

test('allows keeping ndaRequired enabled', () => {
  assert.equal(getNdaRequirementDisableRejection(true, true), null);
});

test('allows idempotent false when meeting was created without NDA', () => {
  assert.equal(getNdaRequirementDisableRejection(false, false), null);
});

test('rejects disabling NDA on an NDA-required meeting', () => {
  const rejection = getNdaRequirementDisableRejection(true, false);
  assert.equal(rejection?.status, 409);
  assert.match(rejection?.error || '', /Cannot disable NDA requirement/);
});

test('rejects disabling NDA when current value is unset (defaults to required)', () => {
  const rejection = getNdaRequirementDisableRejection(null, false);
  assert.equal(rejection?.status, 409);
});
