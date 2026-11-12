import { z } from 'zod';
import {
  classItemSchema,
  classListEnvelopeSchema,
  createClassRequestSchema,
  updateClassRequestSchema,
  classFiltersSchema,
} from './schemas/class.schema';

export type ClassItem = z.infer<typeof classItemSchema>;
export type ClassListResponse = z.infer<typeof classListEnvelopeSchema>;
export type CreateClassRequest = z.infer<typeof createClassRequestSchema>;
export type UpdateClassRequest = z.infer<typeof updateClassRequestSchema>;
export type ClassFilters = z.infer<typeof classFiltersSchema>;

export type ClassViewMode = 'grid' | 'list';

export type WorkspaceRoleMode = 'faculty' | 'student';

export interface ClassKpiStats {
  activeClassesCount: number;
  totalStudentsCount: number;
  needsAttentionCount: number;
}

export interface StudentClassKpiStats {
  enrolledClassesCount: number;
  upcomingAssignmentsCount: number;
  avgProgressPercent: number;
}
