import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveNdaContentForSignature } from './nda-signature-content.ts';

test('uses meeting customized content when no signatures exist', () => {
  assert.equal(
    resolveNdaContentForSignature([], 'Meeting NDA V1', 'Template V2'),
    'Meeting NDA V1',
  );
});

test('falls back to live template content when meeting content is empty', () => {
  assert.equal(
    resolveNdaContentForSignature([], null, 'Template V1'),
    'Template V1',
  );
  assert.equal(
    resolveNdaContentForSignature([], '', 'Template V1'),
    'Template V1',
  );
});

test('reuses the first non-empty signature snapshot over live meeting/template content', () => {
  assert.equal(
    resolveNdaContentForSignature(
      ['Signed NDA V1', 'Signed NDA V1'],
      'Meeting NDA V2',
      'Template V3',
    ),
    'Signed NDA V1',
  );
});

test('skips empty prior snapshots before locking to the first real one', () => {
  assert.equal(
    resolveNdaContentForSignature(
      [null, '', 'Signed NDA V1'],
      'Meeting NDA V2',
      'Template V3',
    ),
    'Signed NDA V1',
  );
});

test('returns null when no prepared NDA content is available', () => {
  assert.equal(resolveNdaContentForSignature([], null, null), null);
  assert.equal(resolveNdaContentForSignature(['', null], '', ''), null);
});
