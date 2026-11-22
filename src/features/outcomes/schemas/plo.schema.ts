import { z } from 'zod';

export const bloomLevelSchema = z.enum([
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYZE',
  'EVALUATE',
  'CREATE',
]);
export type BloomLevel = z.infer<typeof bloomLevelSchema>;

export const ploSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
  bloomLevel: bloomLevelSchema,
  orderIndex: z.number().int().default(1),
  createdById: z.string().optional(),
  createdByName: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Plo = z.infer<typeof ploSchema>;

export const linkedCloSchema = z.object({
  id: z.string(),
  courseId: z.string().optional(),
  courseTitle: z.string().optional(),
  code: z.string(),
  description: z.string(),
  bloomLevel: bloomLevelSchema,
});
export type LinkedClo = z.infer<typeof linkedCloSchema>;

export const ploDetailSchema = ploSchema.extend({
  linkedClos: z.array(linkedCloSchema).default([]),
});
export type PloDetail = z.infer<typeof ploDetailSchema>;

export const createPloSchema = z.object({
  code: z.string().min(1, 'Mã PLO không được để trống'),
  description: z.string().min(1, 'Mô tả PLO không được để trống'),
  bloomLevel: bloomLevelSchema,
  orderIndex: z.number().int().default(1),
});
export type CreatePloInput = z.infer<typeof createPloSchema>;

export const updatePloSchema = createPloSchema.partial();
export type UpdatePloInput = z.infer<typeof updatePloSchema>;

export const paginatedPloSchema = z.object({
  content: z.array(ploSchema),
  pageNumber: z.number().int().default(0),
  pageSize: z.number().int().default(20),
  totalElements: z.number().int().default(0),
  totalPages: z.number().int().default(1),
});
export type PaginatedPlos = z.infer<typeof paginatedPloSchema>;
