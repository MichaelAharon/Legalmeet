import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canShowMeetingJoinCta,
  getInitialMeetingStatus,
} from './meeting-readiness.ts';

test('getInitialMeetingStatus is scheduled when NDA is required', () => {
  assert.equal(getInitialMeetingStatus(true), 'scheduled');
});

test('getInitialMeetingStatus is ready when NDA is not required', () => {
  assert.equal(getInitialMeetingStatus(false), 'ready');
});

test('canShowMeetingJoinCta is true for ready meetings', () => {
  assert.equal(canShowMeetingJoinCta({ status: 'ready', ndaRequired: true }), true);
  assert.equal(canShowMeetingJoinCta({ status: 'ready', ndaRequired: false }), true);
});

test('canShowMeetingJoinCta is true for scheduled non-NDA meetings', () => {
  // Production schema may leave non-NDA meetings as scheduled; UI must still offer Join.
  assert.equal(canShowMeetingJoinCta({ status: 'scheduled', ndaRequired: false }), true);
});

test('canShowMeetingJoinCta is false for scheduled NDA meetings', () => {
  assert.equal(canShowMeetingJoinCta({ status: 'scheduled', ndaRequired: true }), false);
  assert.equal(canShowMeetingJoinCta({ status: 'awaiting_signatures', ndaRequired: true }), false);
});
