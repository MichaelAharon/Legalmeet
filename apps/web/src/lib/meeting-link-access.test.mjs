import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canJoinMeeting,
  shouldShowMeetingLinkNdaFlow,
} from './meeting-link-access.ts';

test('canJoinMeeting is true for non-NDA meetings even when unsigned', () => {
  assert.equal(canJoinMeeting({ ndaRequired: false }, false), true);
  assert.equal(canJoinMeeting({ ndaRequired: false }, true), true);
});

test('canJoinMeeting requires allSigned for NDA meetings', () => {
  assert.equal(canJoinMeeting({ ndaRequired: true }, false), false);
  assert.equal(canJoinMeeting({ ndaRequired: true }, true), true);
});

test('canJoinMeeting treats null/undefined ndaRequired as joinable (join-page parity)', () => {
  assert.equal(canJoinMeeting({ ndaRequired: null }, false), true);
  assert.equal(canJoinMeeting({}, false), true);
});

test('shouldShowMeetingLinkNdaFlow is only true when NDA is required', () => {
  assert.equal(shouldShowMeetingLinkNdaFlow({ ndaRequired: true }), true);
  assert.equal(shouldShowMeetingLinkNdaFlow({ ndaRequired: false }), false);
  assert.equal(shouldShowMeetingLinkNdaFlow({ ndaRequired: null }), false);
  assert.equal(shouldShowMeetingLinkNdaFlow({}), false);
});
