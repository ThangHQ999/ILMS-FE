import {
  TimetableSession,
  TimetableKpis,
  SwapRoomFormValues,
} from './schemas/timetable.schema';

export type { TimetableSession, TimetableKpis, SwapRoomFormValues };

export type TimetableFilterType = 'all' | 'theory' | 'lab' | 'exam';

export interface DaySchedule {
  dayOfWeek: number; // 1: Mon, ..., 6: Sat, 0: Sun
  dayNameKey: string; // 'monday', 'tuesday', etc.
  dateString: string; // e.g. "21/10"
  fullDate: string; // e.g. "2024-10-21"
  isToday?: boolean;
  sessions: TimetableSession[];
}

export interface WeeklyTimetableData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  semesterName: string;
  facultyName: string;
  kpis: TimetableKpis;
  days: DaySchedule[];
}

