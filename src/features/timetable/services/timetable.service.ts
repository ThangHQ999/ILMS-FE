import {
  WeeklyTimetableData,
  SwapRoomFormValues,
  TimetableSession,
  DaySchedule,
} from '../types';
import {
  EVEN_WEEK_SESSIONS_TEMPLATE,
  ODD_WEEK_SESSIONS_TEMPLATE,
  MOCK_WEEKLY_TIMETABLE_DATA,
} from '../constants';

function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDateIso(d: Date): string {
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function formatDateSlash(d: Date): string {
  return `${padZero(d.getDate())}/${padZero(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateShort(d: Date): string {
  return `${padZero(d.getDate())}/${padZero(d.getMonth() + 1)}`;
}

/**
 * Calculates Monday (start of the week) for a given weekNumber in the academic semester.
 * Base reference: Week 9 begins on Monday October 21, 2024.
 */
export function getWeekStartDate(weekNumber: number): Date {
  const baseWeek = 9;
  const baseMonday = new Date(2024, 9, 21); // 21/10/2024 is Monday of Week 9
  const diffDays = (weekNumber - baseWeek) * 7;
  const target = new Date(baseMonday);
  target.setDate(target.getDate() + diffDays);
  return target;
}

/**
 * Estimates week number from any Date based on the semester base start date.
 */
export function getWeekNumberFromDate(date: Date): number {
  const baseWeek = 9;
  const baseMonday = new Date(2024, 9, 21);
  const diffMs = date.getTime() - baseMonday.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(20, baseWeek + diffWeeks));
}

/**
 * Mock data fetching function that dynamically generates complete WeeklyTimetableData
 * based on weekStartDate. Alternates between distinct schedules (e.g. Even vs Odd weeks)
 * and dynamically calculates actual calendar dates for all 7 days of the week.
 */
export const fetchMockTimetable = (
  weekStartDate: Date,
  explicitWeekNumber?: number
): WeeklyTimetableData => {
  const weekNumber = explicitWeekNumber ?? getWeekNumberFromDate(weekStartDate);
  const isEven = weekNumber % 2 === 0;

  const daysInfo = [
    { dayOfWeek: 1, dayNameKey: 'monday' },
    { dayOfWeek: 2, dayNameKey: 'tuesday' },
    { dayOfWeek: 3, dayNameKey: 'wednesday' },
    { dayOfWeek: 4, dayNameKey: 'thursday' },
    { dayOfWeek: 5, dayNameKey: 'friday' },
    { dayOfWeek: 6, dayNameKey: 'saturday' },
    { dayOfWeek: 0, dayNameKey: 'sunday' },
  ];

  const todayIso = formatDateIso(new Date());

  const dayDates = daysInfo.map((info, idx) => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + idx);
    const fullDate = formatDateIso(d);
    const dateString = formatDateShort(d);
    return {
      ...info,
      dateObj: d,
      fullDate,
      dateString,
      isToday: fullDate === todayIso || (weekNumber === 9 && info.dayOfWeek === 3),
    };
  });

  const startDate = formatDateSlash(dayDates[0].dateObj);
  const endDate = formatDateSlash(dayDates[6].dateObj);

  // Select completely different templates based on Even/Odd week
  const templates = isEven ? EVEN_WEEK_SESSIONS_TEMPLATE : ODD_WEEK_SESSIONS_TEMPLATE;

  // Build sessions with synchronous date matching each day of this week
  const sessions: TimetableSession[] = templates.map((tpl, idx) => {
    const matchedDay = dayDates.find((d) => d.dayOfWeek === tpl.dayOfWeek);
    const sessionDate = matchedDay ? matchedDay.fullDate : formatDateIso(weekStartDate);
    return {
      ...tpl,
      lessonSessionId: `SES-W${weekNumber}-${tpl.classId}-${tpl.startShift}-${idx}`,
      sessionDate,
    };
  });

  // Group into DaySchedule[]
  const days: DaySchedule[] = dayDates.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    dayNameKey: day.dayNameKey,
    dateString: day.dateString,
    fullDate: day.fullDate,
    isToday: day.isToday,
    sessions: sessions.filter((s) => s.dayOfWeek === day.dayOfWeek),
  }));

  const totalSessions = sessions.length;
  const totalPeriods = sessions.reduce(
    (sum, s) => sum + ((s.endShift || 3) - (s.startShift || 1) + 1),
    0
  );
  const labSessions = sessions.filter((s) => s.sessionType === 'lab').length;

  return {
    weekNumber,
    startDate,
    endDate,
    semesterName: 'Học kỳ 1 (2024-2025)',
    facultyName: 'Khoa Công nghệ Thông tin',
    kpis: {
      totalSessions,
      totalPeriods,
      labSessions,
      peakDay: isEven ? 'Thứ 5' : 'Thứ 4',
      peakConsecutive: isEven ? 4 : 3,
      syncTimeText: 'Vừa đồng bộ vài giây trước',
    },
    days,
  };
};

export async function getWeeklyTimetable(weekNumber: number = 9): Promise<WeeklyTimetableData> {
  const weekStartDate = getWeekStartDate(weekNumber);
  return fetchMockTimetable(weekStartDate, weekNumber);
}

export async function submitSwapRoomRequest(_payload: SwapRoomFormValues): Promise<{ success: boolean }> {
  // In real backend, call api.post('/academic/room-swap', payload)
  return { success: true };
}
