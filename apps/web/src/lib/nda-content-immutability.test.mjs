import assert from 'node:assert/strict';
import test from 'node:test';
import { getNdaContentMutationRejection } from './nda-content-immutability.ts';

const current = {
  ndaCustomizedContent: 'Agreement A',
  ndaTemplateId: 'template-1',
};

test('allows NDA content changes before any signatures', () => {
  assert.equal(
    getNdaContentMutationRejection(false, current, {
      ndaCustomizedContent: 'Agreement B',
    }),
    null,
  );
});

test('allows omitting NDA fields after signatures exist', () => {
  assert.equal(getNdaContentMutationRejection(true, current, {}), null);
});

test('allows idempotent NDA content updates after signatures exist', () => {
  assert.equal(
    getNdaContentMutationRejection(true, current, {
      ndaCustomizedContent: 'Agreement A',
      ndaTemplateId: 'template-1',
    }),
    null,
  );
});

test('rejects changing NDA content after signatures exist', () => {
  const rejection = getNdaContentMutationRejection(true, current, {
    ndaCustomizedContent: 'Agreement B',
  });
  assert.equal(rejection?.status, 409);
  assert.match(rejection?.error || '', /Cannot change NDA content/);
});

test('rejects changing NDA template after signatures exist', () => {
  const rejection = getNdaContentMutationRejection(true, current, {
    ndaTemplateId: 'template-2',
  });
  assert.equal(rejection?.status, 409);
});

test('rejects clearing customized content after signatures exist', () => {
  const rejection = getNdaContentMutationRejection(true, current, {
    ndaCustomizedContent: null,
  });
  assert.equal(rejection?.status, 409);
});
