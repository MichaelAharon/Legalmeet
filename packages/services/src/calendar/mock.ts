import type { ICalendarService, CalendarEventInput, CalendarEventResult } from './interface';

export class MockCalendarService implements ICalendarService {
  private events = new Map<string, CalendarEventResult>();

  async createEvent(input: CalendarEventInput): Promise<CalendarEventResult> {
    const id = `mock-cal-${Date.now()}`;
    const result: CalendarEventResult = {
      providerEventId: id,
      title: input.title,
      startTime: input.startTime,
      endTime: input.endTime,
      htmlLink: `https://calendar.google.com/event?eid=${id}`,
      status: 'confirmed',
    };
    this.events.set(id, result);
    return result;
  }

  async updateEvent(providerId: string, input: Partial<CalendarEventInput>): Promise<CalendarEventResult> {
    const existing = this.events.get(providerId);
    const result: CalendarEventResult = {
      providerEventId: providerId,
      title: input.title || existing?.title || 'Updated Event',
      startTime: input.startTime || existing?.startTime || new Date().toISOString(),
      endTime: input.endTime || existing?.endTime || new Date().toISOString(),
      htmlLink: existing?.htmlLink,
      status: 'confirmed',
    };
    this.events.set(providerId, result);
    return result;
  }

  async deleteEvent(providerId: string): Promise<void> {
    this.events.delete(providerId);
  }

  async listEvents(startDate: string, endDate: string): Promise<CalendarEventResult[]> {
    return Array.from(this.events.values()).filter(e => e.startTime >= startDate && e.startTime <= endDate);
  }
}
