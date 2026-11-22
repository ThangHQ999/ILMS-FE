import { z } from 'zod';
import { bloomLevelSchema, ploSchema } from './plo.schema';

export const cloSchema = z.object({
  id: z.string(),
  courseId: z.string().optional(),
  code: z.string(),
  description: z.string(),
  bloomLevel: bloomLevelSchema,
  orderIndex: z.number().int().default(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Clo = z.infer<typeof cloSchema>;

export const cloConceptSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  weight: z.number().min(0).max(1),
});
export type CloConcept = z.infer<typeof cloConceptSchema>;

export const cloDetailSchema = cloSchema.extend({
  linkedPlos: z.array(ploSchema).default([]),
  concepts: z.array(cloConceptSchema).default([]),
});
export type CloDetail = z.infer<typeof cloDetailSchema>;

export const createCloSchema = z.object({
  code: z.string().min(1, 'Mã CLO không được để trống'),
  description: z.string().min(1, 'Mô tả CLO không được để trống'),
  bloomLevel: bloomLevelSchema,
  orderIndex: z.number().int().default(1),
});
export type CreateCloInput = z.infer<typeof createCloSchema>;

export const updateCloSchema = createCloSchema.partial();
export type UpdateCloInput = z.infer<typeof updateCloSchema>;

export const contributionLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type ContributionLevel = z.infer<typeof contributionLevelSchema>;

export const cloPloMappingItemSchema = z.object({
  cloId: z.string(),
  ploId: z.string(),
  contributionLevel: contributionLevelSchema,
});
export type CloPloMappingItem = z.infer<typeof cloPloMappingItemSchema>;

export const cloPloMatrixSchema = z.object({
  courseId: z.string().optional(),
  mappings: z.array(cloPloMappingItemSchema).default([]),
});
export type CloPloMatrix = z.infer<typeof cloPloMatrixSchema>;

export const updateCloPloMatrixSchema = z.object({
  mappings: z.array(cloPloMappingItemSchema),
});
export type UpdateCloPloMatrixInput = z.infer<typeof updateCloPloMatrixSchema>;

export const updateCloConceptsSchema = z.object({
  concepts: z.array(cloConceptSchema),
});
export type UpdateCloConceptsInput = z.infer<typeof updateCloConceptsSchema>;
