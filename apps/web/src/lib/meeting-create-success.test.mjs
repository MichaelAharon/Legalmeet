import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Load via experimental strip-types path used by package test script.
const { shouldMarkNdaMeetingCreated } = await import('./meeting-create-success.ts');

describe('shouldMarkNdaMeetingCreated', () => {
  it('is false when only create succeeded (false success bug)', () => {
    assert.equal(
      shouldMarkNdaMeetingCreated({
        meetingCreated: true,
        contentSaved: false,
        hostSigned: false,
      }),
      false,
    );
  });

  it('is false when create and content save succeeded but sign failed', () => {
    assert.equal(
      shouldMarkNdaMeetingCreated({
        meetingCreated: true,
        contentSaved: true,
        hostSigned: false,
      }),
      false,
    );
  });

  it('is true only after create, content save, and host sign', () => {
    assert.equal(
      shouldMarkNdaMeetingCreated({
        meetingCreated: true,
        contentSaved: true,
        hostSigned: true,
      }),
      true,
    );
  });
});
