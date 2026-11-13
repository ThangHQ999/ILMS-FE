import { WeeklyTimetableData, SwapRoomFormValues } from '../types';
import { MOCK_WEEKLY_TIMETABLE_DATA } from '../constants';

export async function getWeeklyTimetable(weekNumber: number = 9): Promise<WeeklyTimetableData> {
  // Simulate network latency if needed, returns typed WeeklyTimetableData
  return {
    ...MOCK_WEEKLY_TIMETABLE_DATA,
    weekNumber,
  };
}

export async function submitSwapRoomRequest(_payload: SwapRoomFormValues): Promise<{ success: boolean }> {
  // In real backend, call api.post('/academic/room-swap', payload)
  return { success: true };
}

