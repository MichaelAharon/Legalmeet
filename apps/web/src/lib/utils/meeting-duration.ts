/** Fallback used by calendar conflict detection when a meeting has no stored duration. */
export const DEFAULT_MEETING_DURATION_MINUTES = 60;

/** Parse a duration-in-minutes query/form value. Invalid input is ignored. */
export function parseMeetingDurationMinutes(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function durationMinutesToSeconds(minutes: number | null | undefined): number | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;
  return Math.round(minutes * 60);
}

/**
 * Minutes used for calendar overlap checks.
 * Meetings with no stored duration are treated as 60 minutes — matching the
 * scheduler default — so conflict detection stays defined. Persisted values
 * (including 30/45/90) must be used so a 90-minute booking still blocks the
 * extra half hour instead of collapsing to the default.
 */
export function meetingDurationMinutesForConflicts(durationSeconds: number | null | undefined): number {
  if (durationSeconds != null && Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return durationSeconds / 60;
  }
  return DEFAULT_MEETING_DURATION_MINUTES;
}

/** Accept durationSeconds or durationMinutes from a create payload. */
export function resolveCreateDurationSeconds(body: {
  durationSeconds?: unknown;
  durationMinutes?: unknown;
}): number | null {
  if (typeof body.durationSeconds === 'number' && Number.isFinite(body.durationSeconds) && body.durationSeconds > 0) {
    return Math.round(body.durationSeconds);
  }
  if (typeof body.durationMinutes === 'number' && Number.isFinite(body.durationMinutes) && body.durationMinutes > 0) {
    return Math.round(body.durationMinutes * 60);
  }
  return null;
}

export function buildNewMeetingScheduleHref(opts: {
  title: string;
  scheduledAtLocal: string;
  durationMinutes: number;
}): string {
  const params = new URLSearchParams({
    title: opts.title,
    scheduledAt: opts.scheduledAtLocal,
    duration: String(opts.durationMinutes),
  });
  return `/meetings/new?${params.toString()}`;
}
