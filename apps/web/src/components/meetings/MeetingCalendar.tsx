'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, AlertTriangle, Lock } from 'lucide-react';
import { Button, Badge, Input, Textarea, Switch } from '@legalmeet/ui';
import { cn } from '@/lib/utils/cn';

type Meeting = {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  durationSeconds?: number | null;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusColor: Record<string, string> = {
  scheduled: 'bg-indigo-500',
  awaiting_signatures: 'bg-amber-500',
  ready: 'bg-emerald-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-slate-400',
  cancelled: 'bg-red-400',
};

// Business hours: 8 AM - 6 PM in 30-min slots
const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? '00' : '30';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return { label: `${h12}:${min} ${ampm}`, hour, minute: parseInt(min) };
});

/** Convert a time slot to minutes since midnight */
function slotToMinutes(slot: { hour: number; minute: number }) {
  return slot.hour * 60 + slot.minute;
}

/** Get start minutes from a meeting's scheduledAt */
function meetingStartMinutes(scheduledAt: string): number {
  const d = new Date(scheduledAt);
  return d.getHours() * 60 + d.getMinutes();
}

/** Default meeting duration = 60 minutes */
const DEFAULT_DURATION = 60;

/** Check if a time slot overlaps with a meeting */
function slotOverlapsMeeting(
  slotMinutes: number,
  slotDuration: number,
  meetingStart: number,
  meetingDuration: number,
): boolean {
  const slotEnd = slotMinutes + slotDuration;
  const meetingEnd = meetingStart + meetingDuration;
  return slotMinutes < meetingEnd && meetingStart < slotEnd;
}

export function MeetingCalendar({ meetings, onDayClick }: { meetings: Meeting[]; onDayClick?: (date: Date) => void }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Schedule dialog state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<typeof TIME_SLOTS[number] | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(60); // minutes
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ day: number; date: Date; isCurrentMonth: boolean }> = [];

    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevDays - i, date: new Date(year, month - 1, prevDays - i), isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, date: new Date(year, month, d), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, date: new Date(year, month + 1, d), isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const meetingsByDate = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    for (const m of meetings) {
      if (!m.scheduledAt) continue;
      const key = new Date(m.scheduledAt).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [meetings]);

  const today = new Date().toDateString();
  const selectedMeetings = selectedDay ? (meetingsByDate[selectedDay] || []) : [];

  // Meetings on the schedule dialog's selected date
  const meetingsOnScheduleDate = useMemo(() => {
    if (!scheduleDate) return [];
    const key = scheduleDate.toDateString();
    return meetingsByDate[key] || [];
  }, [scheduleDate, meetingsByDate]);

  // Blocked time slots for selected schedule date
  const blockedSlots = useMemo(() => {
    const blocked = new Set<string>();
    for (const m of meetingsOnScheduleDate) {
      const mStart = meetingStartMinutes(m.scheduledAt);
      const mDur = m.durationSeconds ? m.durationSeconds / 60 : DEFAULT_DURATION;
      for (const slot of TIME_SLOTS) {
        if (slotOverlapsMeeting(slotToMinutes(slot), 30, mStart, mDur)) {
          blocked.add(slot.label);
        }
      }
    }
    return blocked;
  }, [meetingsOnScheduleDate]);

  // Check for conflicts when slot or duration changes
  useEffect(() => {
    if (!selectedSlot || !scheduleDate) {
      setConflictWarning(null);
      return;
    }
    const slotMin = slotToMinutes(selectedSlot);
    const conflict = meetingsOnScheduleDate.find((m) => {
      const mStart = meetingStartMinutes(m.scheduledAt);
      const mDur = m.durationSeconds ? m.durationSeconds / 60 : DEFAULT_DURATION;
      return slotOverlapsMeeting(slotMin, meetingDuration, mStart, mDur);
    });
    if (conflict) {
      const cTime = new Date(conflict.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      setConflictWarning(`Conflicts with "${conflict.title}" at ${cTime}`);
    } else {
      setConflictWarning(null);
    }
  }, [selectedSlot, meetingDuration, meetingsOnScheduleDate, scheduleDate]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (date: Date, dateKey: string) => {
    setSelectedDay(dateKey);
    onDayClick?.(date);
  };

  const openScheduleDialog = (date: Date) => {
    setScheduleDate(date);
    setSelectedSlot(null);
    setMeetingTitle('');
    setMeetingDuration(60);
    setConflictWarning(null);
    setScheduleOpen(true);
  };

  const handleScheduleConfirm = () => {
    if (!scheduleDate || !selectedSlot || !meetingTitle || conflictWarning) return;
    // Build the datetime and navigate to /meetings/new with pre-filled params
    const dt = new Date(scheduleDate);
    dt.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0);
    const isoLocal = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    router.push(`/meetings/new?title=${encodeURIComponent(meetingTitle)}&scheduledAt=${encodeURIComponent(isoLocal)}`);
    setScheduleOpen(false);
  };

  const formattedScheduleDate = scheduleDate
    ? scheduleDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid — disabled when schedule dialog is open */}
      <div className={cn(
        'grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden transition-opacity',
        scheduleOpen && 'opacity-40 pointer-events-none',
      )}>
        {calendarDays.map(({ day, date, isCurrentMonth }, i) => {
          const dateKey = date.toDateString();
          const dayMeetings = meetingsByDate[dateKey] || [];
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDay;

          return (
            <button
              key={i}
              onClick={() => handleDayClick(date, dateKey)}
              className={cn(
                'min-h-[80px] p-1.5 text-left bg-white dark:bg-slate-900 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
                !isCurrentMonth && 'opacity-40',
                isSelected && 'ring-2 ring-indigo-500 ring-inset',
              )}
            >
              <span className={cn(
                'inline-flex items-center justify-center h-6 w-6 text-xs rounded-full',
                isToday && 'bg-indigo-600 text-white font-bold',
              )}>
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayMeetings.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center gap-1">
                    <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', statusColor[m.status] || 'bg-slate-400')} />
                    <span className="text-[10px] truncate leading-tight">{m.title}</span>
                  </div>
                ))}
                {dayMeetings.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{dayMeetings.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && !scheduleOpen && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">
              {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <Button size="sm" onClick={() => openScheduleDialog(new Date(selectedDay))}>
              <Plus className="h-3 w-3 mr-1" />Book Meeting
            </Button>
          </div>
          {selectedMeetings.length === 0 ? (
            <p className="text-sm text-slate-500">No meetings scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedMeetings.map(m => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', statusColor[m.status] || 'bg-slate-400')} />
                    <span className="text-sm font-medium">{m.title}</span>
                  </div>
                  <Badge variant={m.status === 'completed' ? 'default' : m.status === 'ready' ? 'success' : 'outline'}>
                    {m.status.replace('_', ' ')}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== SCHEDULE MEETING DIALOG ========== */}
      {scheduleOpen && (
        <div className="border-2 border-indigo-300 dark:border-indigo-700 rounded-lg p-5 bg-white dark:bg-slate-900 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Schedule Meeting</h3>
            <Button variant="ghost" size="sm" onClick={() => setScheduleOpen(false)} className="text-xs">
              Cancel
            </Button>
          </div>

          {/* Locked date badge */}
          <div className="flex items-center gap-2 rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formattedScheduleDate}</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              <Lock className="h-3 w-3" /> Date locked
            </span>
          </div>

          {/* Already booked meetings on this date */}
          {meetingsOnScheduleDate.length > 0 && (
            <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-1.5 bg-slate-50 dark:bg-slate-800/40">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Already booked</p>
              {meetingsOnScheduleDate.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-indigo-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(m.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <span className="text-slate-400">
                    ({m.durationSeconds ? Math.round(m.durationSeconds / 60) : DEFAULT_DURATION} min)
                  </span>
                  <span className="text-slate-500">— {m.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Meeting title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Meeting Title</label>
            <Input
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g., Partnership Discussion"
              className="text-sm"
            />
          </div>

          {/* Time slots grid */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Select Time</label>
            <div className="grid grid-cols-4 gap-1.5">
              {TIME_SLOTS.map((slot) => {
                const isBlocked = blockedSlots.has(slot.label);
                const isSelected = selectedSlot?.label === slot.label;
                return (
                  <button
                    key={slot.label}
                    disabled={isBlocked}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'px-2 py-1.5 rounded text-xs font-mono transition-all',
                      isBlocked
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-300 dark:text-red-700 line-through cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300',
                    )}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Duration</label>
            <div className="flex gap-2">
              {[30, 45, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setMeetingDuration(d)}
                  className={cn(
                    'px-3 py-1.5 rounded text-xs font-medium transition-all',
                    meetingDuration === d
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50',
                  )}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Conflict warning */}
          {conflictWarning && (
            <div className="flex items-start gap-2 rounded-md border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">Double Booking Detected</p>
                <p className="text-[11px] text-red-500 dark:text-red-400/80 mt-0.5">{conflictWarning}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleScheduleConfirm}
              disabled={!meetingTitle || !selectedSlot || !!conflictWarning}
            >
              {conflictWarning ? 'Time Unavailable' : 'Continue to Book'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
