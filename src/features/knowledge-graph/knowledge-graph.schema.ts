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
  canonicalCode: z.string().optional(),
  topic: z.string().optional(),
  kind: z.string().optional(),
  materialId: z.string().optional(),
  materialTitle: z.string().optional(),
  linkedLessonIds: z.array(z.string()).optional(),
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
  rawRelation: z.string().optional(),
  relationshipType: knowledgeRelationshipSchema,
  animated: z.boolean().optional(),
  dashed: z.boolean().optional(),
  weight: z.number().optional(),
});

export const knowledgeGraphPayloadSchema = z.object({
  nodes: z.array(knowledgeNodeDataSchema),
  edges: z.array(knowledgeEdgeDataSchema),
});

// --- Real Backend Neo4j Knowledge Graph DTO Schemas (docs/api-spec.md §16.2) ---

export const publishedGraphSummarySchema = z
  .object({
    materialId: z.string().optional(),
    id: z.string().optional(),
    publicationId: z.string().nullable().optional(),
    title: z.string().optional(),
    materialTitle: z.string().optional(),
    subject: z.string().nullable().optional(),
    courseId: z.string().nullable().optional(),
    courseTitle: z.string().nullable().optional(),
    conceptsCount: z.number().nullable().optional(),
    nodeCount: z.number().nullable().optional(),
    relationsCount: z.number().nullable().optional(),
    edgeCount: z.number().nullable().optional(),
    revision: z.number().nullable().optional(),
    status: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    materialId: raw.materialId ?? raw.id ?? '',
    publicationId: raw.publicationId ?? null,
    title: raw.title ?? raw.materialTitle ?? 'Untitled Graph',
    subject: raw.subject ?? null,
    courseId: raw.courseId ?? null,
    courseTitle: raw.courseTitle ?? null,
    conceptsCount: raw.conceptsCount ?? raw.nodeCount ?? 0,
    relationsCount: raw.relationsCount ?? raw.edgeCount ?? 0,
    revision: raw.revision ?? null,
    status: raw.status ?? 'PUBLISHED',
    publishedAt: raw.publishedAt ?? raw.updatedAt ?? null,
  }));
export type PublishedGraphSummary = z.infer<typeof publishedGraphSummarySchema>;

export const publishedGraphsPageSchema = z.object({
  items: z.array(publishedGraphSummarySchema).default([]),
  nextCursor: z.string().nullable().optional(),
  hasMore: z.boolean().default(false),
});
export type PublishedGraphsPage = z.infer<typeof publishedGraphsPageSchema>;

export const publishedGraphRawNodeSchema = z
  .object({
    id: z.string().optional(),
    nodeId: z.string().optional(),
    canonicalCode: z.string().nullable().optional(),
    canonical_code: z.string().nullable().optional(),
    label: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    concept: z.string().nullable().optional(),
    conceptName: z.string().nullable().optional(),
    concept_name: z.string().nullable().optional(),
    entityName: z.string().nullable().optional(),
    entity_name: z.string().nullable().optional(),
    canonicalName: z.string().nullable().optional(),
    canonical_name: z.string().nullable().optional(),
    displayName: z.string().nullable().optional(),
    display_name: z.string().nullable().optional(),
    topicName: z.string().nullable().optional(),
    topic_name: z.string().nullable().optional(),
    kind: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    topic: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    level: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    definition: z.union([z.string(), z.record(z.string(), z.unknown())]).nullable().optional(),
    content: z.string().nullable().optional(),
    text: z.string().nullable().optional(),
    locator: z.string().nullable().optional(),
    heading: z.string().nullable().optional(),
    heading_path: z.string().nullable().optional(),
    claim: z.string().nullable().optional(),
    hypothesis: z.string().nullable().optional(),
    action: z.string().nullable().optional(),
    masteryPercent: z.number().nullable().optional(),
    status: z.string().nullable().optional(),
    prerequisites: z.array(z.string()).optional(),
    linkedLessonIds: z.array(z.string()).optional(),
    materialId: z.string().nullable().optional(),
    materialTitle: z.string().nullable().optional(),
    attributes: z.record(z.string(), z.unknown()).nullable().optional(),
    sourceRefs: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .passthrough();
export type PublishedGraphRawNode = z.infer<typeof publishedGraphRawNodeSchema>;

export const publishedGraphRawEdgeSchema = z
  .object({
    id: z.string().optional(),
    edgeId: z.string().optional(),
    source: z.string().optional(),
    from: z.string().optional(),
    sourceId: z.string().optional(),
    source_id: z.string().optional(),
    fromNodeId: z.string().optional(),
    from_node_id: z.string().optional(),
    startNode: z.string().optional(),
    start_node: z.string().optional(),
    target: z.string().optional(),
    to: z.string().optional(),
    targetId: z.string().optional(),
    target_id: z.string().optional(),
    toNodeId: z.string().optional(),
    to_node_id: z.string().optional(),
    endNode: z.string().optional(),
    end_node: z.string().optional(),
    relation: z.string().nullable().optional(),
    relationType: z.string().nullable().optional(),
    relation_type: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    kind: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    weight: z.number().nullable().optional(),
    attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .passthrough();
export type PublishedGraphRawEdge = z.infer<typeof publishedGraphRawEdgeSchema>;

export const conceptStepSchema = z
  .object({
    stepNumber: z.number().nullable().optional(),
    step_number: z.number().nullable().optional(),
    order: z.number().nullable().optional(),
    action: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    stepNumber: raw.stepNumber ?? raw.step_number ?? raw.order ?? null,
    action: raw.action ?? raw.content ?? raw.description ?? '',
  }));
export type ConceptStep = {
  stepNumber: number;
  action: string;
};

function normalizeSteps(
  steps: Array<{ stepNumber: number | null; action: string }>
): ConceptStep[] {
  return steps.map((step, index) => ({
    stepNumber: step.stepNumber ?? index + 1,
    action: step.action,
  }));
}

export const conceptProcessSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    context: z.string().nullable().optional(),
    steps: z.array(conceptStepSchema).optional(),
    processSteps: z.array(conceptStepSchema).optional(),
    process_steps: z.array(conceptStepSchema).optional(),
  })
  .passthrough()
  .transform((raw) => ({
    id: raw.id,
    name: raw.name ?? raw.title ?? 'Quy trình',
    description: raw.description ?? raw.context ?? '',
    steps: normalizeSteps(raw.steps ?? raw.processSteps ?? raw.process_steps ?? []),
  }));
export type ConceptProcess = z.infer<typeof conceptProcessSchema>;

export const conceptExerciseSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    problem: z.string().nullable().optional(),
    solution: z.string().nullable().optional(),
    steps: z.array(conceptStepSchema).optional(),
    exerciseSteps: z.array(conceptStepSchema).optional(),
    exercise_steps: z.array(conceptStepSchema).optional(),
  })
  .passthrough()
  .transform((raw) => ({
    id: raw.id,
    title: raw.title ?? raw.name ?? 'Bài tập minh họa',
    content: raw.content ?? raw.problem ?? '',
    solution: raw.solution ?? '',
    steps: normalizeSteps(raw.steps ?? raw.exerciseSteps ?? raw.exercise_steps ?? []),
  }));
export type ConceptExercise = z.infer<typeof conceptExerciseSchema>;

export const conceptExampleSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().nullable().optional(),
    explanation: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    codeSnippet: z.string().nullable().optional(),
    code_snippet: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    id: raw.id,
    title: raw.title ?? 'Ví dụ',
    explanation: raw.explanation ?? raw.content ?? '',
    codeSnippet: raw.codeSnippet ?? raw.code_snippet ?? null,
  }));
export type ConceptExample = z.infer<typeof conceptExampleSchema>;

export const conceptArgumentSchema = z
  .object({
    id: z.string().optional(),
    hypothesis: z.string().nullable().optional(),
    claim: z.string().nullable().optional(),
    evidence: z.string().nullable().optional(),
    conclusion: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    id: raw.id,
    hypothesis: raw.hypothesis ?? raw.claim ?? '',
    evidence: raw.evidence ?? '',
    conclusion: raw.conclusion ?? '',
  }));
export type ConceptArgument = z.infer<typeof conceptArgumentSchema>;

export const conceptRelationItemSchema = z
  .object({
    targetCode: z.string().nullable().optional(),
    target_code: z.string().nullable().optional(),
    canonicalCode: z.string().nullable().optional(),
    targetName: z.string().nullable().optional(),
    target_name: z.string().nullable().optional(),
    relatedConcept: z.string().nullable().optional(),
    related_concept: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    relationType: z.string().nullable().optional(),
    relation_type: z.string().nullable().optional(),
    relation: z.string().nullable().optional(),
    direction: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    targetCode: raw.targetCode ?? raw.target_code ?? raw.canonicalCode ?? null,
    targetName:
      raw.targetName ?? raw.target_name ?? raw.relatedConcept ?? raw.related_concept ?? raw.name ?? '',
    relationType: raw.relationType ?? raw.relation_type ?? raw.relation ?? 'RELATED_TO',
    direction: raw.direction ?? 'OUTGOING',
  }));
export type ConceptRelationItem = z.infer<typeof conceptRelationItemSchema>;

export const conceptDetailSchema = z
  .object({
    canonicalCode: z.string().optional(),
    canonical_code: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    label: z.string().optional(),
    topic: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    definition: z
      .union([z.string(), z.object({ content: z.string().optional() }).passthrough()])
      .nullable()
      .optional(),
    definitions: z.array(z.union([z.string(), z.record(z.string(), z.unknown())])).optional(),
    processes: z.array(conceptProcessSchema).optional(),
    exercises: z.array(conceptExerciseSchema).optional(),
    examples: z.array(conceptExampleSchema).optional(),
    arguments: z.array(conceptArgumentSchema).optional(),
    relations: z.array(conceptRelationItemSchema).optional(),
    sourceQuotes: z.array(z.string()).optional(),
    quotes: z.array(z.string()).optional(),
    linkedLessonIds: z.array(z.string()).optional(),
    materialId: z.string().nullable().optional(),
    materialTitle: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => {
    let definitionText = '';
    const pickText = (obj: unknown): string => {
      if (typeof obj === 'string') return obj.trim();
      if (obj && typeof obj === 'object') {
        const rec = obj as Record<string, unknown>;
        const cand =
          rec.content ??
          rec.text ??
          rec.statement ??
          rec.description ??
          rec.meaning ??
          rec.details ??
          rec.explanation ??
          rec.formula ??
          rec.definition;
        if (typeof cand === 'string') return cand.trim();
      }
      return '';
    };

    definitionText = pickText(raw.definition);
    if (!definitionText && Array.isArray(raw.definitions) && raw.definitions.length > 0) {
      for (const d of raw.definitions) {
        const found = pickText(d);
        if (found) {
          definitionText = found;
          break;
        }
      }
    }
    if (!definitionText && typeof raw.description === 'string' && raw.description.trim()) {
      definitionText = raw.description.trim();
    }

    return {
      canonicalCode: raw.canonicalCode ?? raw.canonical_code ?? raw.id ?? '',
      name: raw.name ?? raw.label ?? raw.canonicalCode ?? 'Khái niệm',
      topic: raw.topic ?? null,
      subject: raw.subject ?? null,
      description: raw.description ?? '',
      definition: definitionText,
      processes: raw.processes ?? [],
      exercises: raw.exercises ?? [],
      examples: raw.examples ?? [],
      arguments: raw.arguments ?? [],
      relations: raw.relations ?? [],
      sourceQuotes: raw.sourceQuotes ?? raw.quotes ?? [],
      linkedLessonIds: raw.linkedLessonIds ?? [],
      materialId: raw.materialId ?? null,
      materialTitle: raw.materialTitle ?? null,
    };
  });
export type ConceptDetail = z.infer<typeof conceptDetailSchema>;

export const graphRevisionItemSchema = z
  .object({
    id: z.string().optional(),
    revisionId: z.string().optional(),
    revision: z.number().nullable().optional(),
    reviewStatus: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    id: raw.revisionId ?? raw.id ?? '',
    revision: raw.revision ?? 1,
    status: raw.reviewStatus ?? raw.status ?? 'UNKNOWN',
    createdAt: raw.createdAt ?? raw.updatedAt ?? null,
    createdBy: raw.createdBy ?? null,
  }));
export type GraphRevisionItem = z.infer<typeof graphRevisionItemSchema>;

export const graphAuditLogItemSchema = z
  .object({
    id: z.string().optional(),
    action: z.string().nullable().optional(),
    eventType: z.string().nullable().optional(),
    actor: z.string().nullable().optional(),
    actorName: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    details: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    timestamp: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    id: raw.id ?? `${raw.action ?? raw.eventType ?? 'audit'}-${raw.createdAt ?? raw.timestamp ?? ''}`,
    action: raw.action ?? raw.eventType ?? 'UPDATED',
    actor: raw.actorName ?? raw.actor ?? null,
    summary: raw.summary ?? raw.details ?? '',
    createdAt: raw.createdAt ?? raw.timestamp ?? null,
  }));
export type GraphAuditLogItem = z.infer<typeof graphAuditLogItemSchema>;
