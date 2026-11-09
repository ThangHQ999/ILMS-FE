import type { ClassFilters } from './types';

export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (filters?: Partial<ClassFilters>) => [...classKeys.lists(), filters ?? {}] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
};

export const AVAILABLE_MAJORS = [
  'Khoa học Máy tính',
  'Kỹ thuật Phần mềm',
  'Hệ thống Thông tin',
  'Mạng máy tính & Truyền thông',
  'Trí tuệ Nhân tạo',
  'An toàn Thông tin',
] as const;

export const DEFAULT_ACADEMIC_YEAR = '2026-2027';
export const CURRENT_SEMESTER = 'Học kỳ 1 (2026-2027)';

