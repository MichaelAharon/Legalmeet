import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getTemplateContentMutationRejection,
  meetingDependsOnLiveTemplate,
} from './nda-template-immutability.ts';

test('allows template content edits when no signed meetings depend on live text', () => {
  assert.equal(
    getTemplateContentMutationRejection({
      contentChanging: true,
      hasDependentSignedMeetings: false,
    }),
    null,
  );
});

test('rejects template content edits when signed meetings still use live template text', () => {
  assert.deepEqual(
    getTemplateContentMutationRejection({
      contentChanging: true,
      hasDependentSignedMeetings: true,
    }),
    {
      error:
        'Cannot change template content while meetings with signatures still depend on the live template text',
      status: 409,
    },
  );
});

test('allows non-content template updates even when dependent meetings exist', () => {
  assert.equal(
    getTemplateContentMutationRejection({
      contentChanging: false,
      hasDependentSignedMeetings: true,
    }),
    null,
  );
});

test('meetingDependsOnLiveTemplate is true only for matching template with empty customized content', () => {
  assert.equal(
    meetingDependsOnLiveTemplate(
      { ndaTemplateId: 'template-1', ndaCustomizedContent: null },
      'template-1',
    ),
    true,
  );
  assert.equal(
    meetingDependsOnLiveTemplate(
      { nda_template_id: 'template-1', nda_customized_content: '' },
      'template-1',
    ),
    true,
  );
  assert.equal(
    meetingDependsOnLiveTemplate(
      { ndaTemplateId: 'template-1', ndaCustomizedContent: 'Frozen text' },
      'template-1',
    ),
    false,
  );
  assert.equal(
    meetingDependsOnLiveTemplate(
      { ndaTemplateId: 'template-2', ndaCustomizedContent: null },
      'template-1',
    ),
    false,
  );
});
