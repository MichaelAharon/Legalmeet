import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyNdaAutoFill, ndaAutoFillKey } from './nda-autofill.ts';

describe('applyNdaAutoFill', () => {
  it('applies non-empty auto-fill values onto an empty map', () => {
    const result = applyNdaAutoFill({}, { party_a: 'LegalMeet Inc.', party_b: 'Acme Corp' });
    assert.deepEqual(result, { party_a: 'LegalMeet Inc.', party_b: 'Acme Corp' });
  });

  it('updates an existing key when the Parties card value changes after mount', () => {
    const current = { party_a: 'LegalMeet Inc.', party_b: 'Acme Corp' };
    const result = applyNdaAutoFill(current, { party_a: 'LegalMeet Inc.', party_b: 'Globex LLC' });
    assert.deepEqual(result, { party_a: 'LegalMeet Inc.', party_b: 'Globex LLC' });
  });

  it('fills a previously empty party after the user types into the Parties card', () => {
    const current = { party_a: 'LegalMeet Inc.' };
    const result = applyNdaAutoFill(current, { party_a: 'LegalMeet Inc.', party_b: 'Globex LLC' });
    assert.equal(result.party_b, 'Globex LLC');
    assert.equal(result.party_a, 'LegalMeet Inc.');
  });

  it('does not overwrite an existing value with an empty auto-fill string', () => {
    const current = { party_b: 'Acme Corp' };
    const result = applyNdaAutoFill(current, { party_b: '' });
    assert.equal(result, current);
    assert.equal(result.party_b, 'Acme Corp');
  });

  it('returns the same object when nothing changed (avoids extra renders)', () => {
    const current = { party_a: 'LegalMeet Inc.' };
    const result = applyNdaAutoFill(current, { party_a: 'LegalMeet Inc.', party_b: '' });
    assert.equal(result, current);
  });

  it('returns current unchanged when autoFill is omitted', () => {
    const current = { party_a: 'LegalMeet Inc.' };
    assert.equal(applyNdaAutoFill(current), current);
    assert.equal(applyNdaAutoFill(current, undefined), current);
  });

  it('does not drop keys that are not in the auto-fill map', () => {
    const current = { party_a: 'A', jurisdiction: 'Delaware' };
    const result = applyNdaAutoFill(current, { party_a: 'B' });
    assert.deepEqual(result, { party_a: 'B', jurisdiction: 'Delaware' });
  });
});

describe('ndaAutoFillKey', () => {
  it('is stable for equivalent maps even when object identity differs', () => {
    assert.equal(ndaAutoFillKey({ party_b: 'Acme' }), ndaAutoFillKey({ party_b: 'Acme' }));
  });

  it('changes when a party name changes', () => {
    assert.notEqual(ndaAutoFillKey({ party_b: 'Acme' }), ndaAutoFillKey({ party_b: 'Globex LLC' }));
  });
});
