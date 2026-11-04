import { z } from 'zod';

export const knowledgeCategorySchema = z.enum(['all', 'ds', 'algo', 'icpc', 'plo', 'math']);

export const knowledgeStatusSchema = z.enum(['mastered', 'learning', 'prerequisite', 'locked']);

export const knowledgeRelationshipSchema = z.enum([
  'requires',
  'optimizes',
  'extends',
  'solves',
  'evaluates',
]);

export const nodeComplexitySchema = z.object({
  time: z.string(),
  space: z.string(),
});

export const knowledgeNodeDataSchema = z.object({
  id: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
  category: z.enum(['ds', 'algo', 'icpc', 'plo', 'math']),
  status: knowledgeStatusSchema,
  masteryScore: z.number().min(0).max(100),
  complexity: nodeComplexitySchema,
  description: z.string(),
  icon: z.string(),
  isCenterpiece: z.boolean().optional(),
  relatedCount: z.number().optional(),
  prerequisites: z.array(z.string()).optional(),
  successors: z.array(z.string()).optional(),
});

export const knowledgeEdgeDataSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  relationshipType: knowledgeRelationshipSchema,
  animated: z.boolean().optional(),
  dashed: z.boolean().optional(),
  weight: z.number().optional(),
});

export const knowledgeGraphPayloadSchema = z.object({
  nodes: z.array(knowledgeNodeDataSchema),
  edges: z.array(knowledgeEdgeDataSchema),
});
