import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getNdaContentLockRejection,
  isNdaContentFieldPatch,
} from './nda-content-lock.ts';

test('isNdaContentFieldPatch detects content and template fields', () => {
  assert.equal(isNdaContentFieldPatch({ title: 'x' }), false);
  assert.equal(isNdaContentFieldPatch({ ndaCustomizedContent: 'A' }), true);
  assert.equal(isNdaContentFieldPatch({ ndaTemplateId: 't1' }), true);
  assert.equal(isNdaContentFieldPatch({ ndaCustomizedContent: null, ndaTemplateId: null }), true);
});

test('allows NDA content changes before any signatures exist', () => {
  assert.equal(
    getNdaContentLockRejection(0, { ndaCustomizedContent: 'Version A' }),
    null,
  );
});

test('rejects NDA content mutation after signatures exist', () => {
  const rejection = getNdaContentLockRejection(1, {
    ndaCustomizedContent: 'Version B — different terms',
  });
  assert.equal(rejection?.status, 409);
  assert.match(rejection?.error || '', /Cannot change NDA content/);
});

test('rejects template rebinding after signatures exist', () => {
  const rejection = getNdaContentLockRejection(2, { ndaTemplateId: 'other-template' });
  assert.equal(rejection?.status, 409);
});

test('allows unrelated meeting fields after signatures exist', () => {
  assert.equal(
    getNdaContentLockRejection(3, { title: 'Retitled meeting', description: 'x' }),
    null,
  );
});
