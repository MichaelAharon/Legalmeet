import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveMeetingNdaContent } from './resolve-meeting-nda-content.ts';

test('prefers non-empty customized meeting content over the template', () => {
  assert.equal(
    resolveMeetingNdaContent('Meeting NDA V1', 'Template V2'),
    'Meeting NDA V1',
  );
});

test('falls back to template content when customized content is missing', () => {
  assert.equal(resolveMeetingNdaContent(null, 'Template V1'), 'Template V1');
  assert.equal(resolveMeetingNdaContent(undefined, 'Template V1'), 'Template V1');
  assert.equal(resolveMeetingNdaContent('', 'Template V1'), 'Template V1');
});

test('returns empty string when neither source has content', () => {
  assert.equal(resolveMeetingNdaContent(null, null), '');
  assert.equal(resolveMeetingNdaContent('', ''), '');
  assert.equal(resolveMeetingNdaContent(undefined, undefined), '');
});
