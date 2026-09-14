import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_MEETING_DURATION_MINUTES,
  buildNewMeetingScheduleHref,
  durationMinutesToSeconds,
  meetingDurationMinutesForConflicts,
  parseMeetingDurationMinutes,
  resolveCreateDurationSeconds,
} from './meeting-duration.ts';

describe('parseMeetingDurationMinutes', () => {
  it('parses a calendar duration query param', () => {
    assert.equal(parseMeetingDurationMinutes('90'), 90);
    assert.equal(parseMeetingDurationMinutes('30'), 30);
  });

  it('rejects missing or invalid values', () => {
    assert.equal(parseMeetingDurationMinutes(null), null);
    assert.equal(parseMeetingDurationMinutes(''), null);
    assert.equal(parseMeetingDurationMinutes('abc'), null);
    assert.equal(parseMeetingDurationMinutes('0'), null);
    assert.equal(parseMeetingDurationMinutes('-15'), null);
  });
});

describe('durationMinutesToSeconds', () => {
  it('converts selected calendar durations', () => {
    assert.equal(durationMinutesToSeconds(90), 5400);
    assert.equal(durationMinutesToSeconds(30), 1800);
    assert.equal(durationMinutesToSeconds(60), 3600);
  });

  it('returns null when duration was not chosen', () => {
    assert.equal(durationMinutesToSeconds(null), null);
  });
});

describe('meetingDurationMinutesForConflicts', () => {
  it('uses the persisted duration so a 90-minute meeting still occupies 3:00 after a 2:00 start', () => {
    assert.equal(meetingDurationMinutesForConflicts(5400), 90);
  });

  it('falls back to 60 minutes when duration was never stored', () => {
    assert.equal(meetingDurationMinutesForConflicts(null), DEFAULT_MEETING_DURATION_MINUTES);
    assert.equal(meetingDurationMinutesForConflicts(undefined), DEFAULT_MEETING_DURATION_MINUTES);
    assert.equal(meetingDurationMinutesForConflicts(0), DEFAULT_MEETING_DURATION_MINUTES);
  });
});

describe('resolveCreateDurationSeconds', () => {
  it('persists durationSeconds from the book-meeting payload', () => {
    assert.equal(resolveCreateDurationSeconds({ durationSeconds: 5400 }), 5400);
  });

  it('accepts durationMinutes as an alternate create field', () => {
    assert.equal(resolveCreateDurationSeconds({ durationMinutes: 90 }), 5400);
  });

  it('does not invent a duration when the client omitted it', () => {
    assert.equal(resolveCreateDurationSeconds({}), null);
  });
});

describe('buildNewMeetingScheduleHref', () => {
  it('forwards duration so Book a Meeting can persist it', () => {
    const href = buildNewMeetingScheduleHref({
      title: 'Partnership Discussion',
      scheduledAtLocal: '2026-09-14T14:00',
      durationMinutes: 90,
    });
    const url = new URL(href, 'http://legalmeet.test');
    assert.equal(url.pathname, '/meetings/new');
    assert.equal(url.searchParams.get('title'), 'Partnership Discussion');
    assert.equal(url.searchParams.get('scheduledAt'), '2026-09-14T14:00');
    assert.equal(url.searchParams.get('duration'), '90');
  });
});
