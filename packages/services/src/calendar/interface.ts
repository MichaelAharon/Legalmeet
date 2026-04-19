export interface ICalendarService {
  createEvent(input: CalendarEventInput): Promise<CalendarEventResult>;
  updateEvent(providerId: string, input: Partial<CalendarEventInput>): Promise<CalendarEventResult>;
  deleteEvent(providerId: string): Promise<void>;
  listEvents(startDate: string, endDate: string): Promise<CalendarEventResult[]>;
}

export interface CalendarEventInput {
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  attendees: Array<{ email: string; name?: string }>;
  meetingUrl?: string;
}

export interface CalendarEventResult {
  providerEventId: string;
  title: string;
  startTime: string;
  endTime: string;
  htmlLink?: string;
  status: string;
}
