/**
 * Pure helper utilities for CRUD operations on Ingestion Draft Knowledge Graph JSON.
 * Ensures consistent synchronization across entities, topics, and knowledge_relations.
 */

export interface DraftProcessStep {
  action: string;
  step_number?: number;
}

export interface DraftProcess {
  name: string;
  description?: string;
  steps?: DraftProcessStep[];
}

export interface DraftExerciseStep {
  action: string;
  step_number?: number;
}

export interface DraftExercise {
  title: string;
  content?: string;
  steps?: DraftExerciseStep[];
}

export interface DraftExample {
  title: string;
  explanation?: string;
  code_snippet?: string;
}

export interface DraftArgument {
  hypothesis?: string;
  evidence?: string;
  conclusion?: string;
}

export interface DraftEntity {
  name: string;
  description?: string;
  definition?: string | { content: string };
  processes?: DraftProcess[];
  exercises?: DraftExercise[];
  examples?: DraftExample[];
  arguments?: DraftArgument[];
}

export interface DraftTopic {
  name: string;
  summary?: string;
  concepts_included?: string[];
}

export interface DraftRelation {
  source: string;
  target: string;
  relation_type: string;
}

export interface DraftGraphData {
  entities?: DraftEntity[];
  topics?: DraftTopic[];
  knowledge_relations?: DraftRelation[];
  issues?: unknown[];
  review_notes?: unknown[];
  [key: string]: unknown;
}

export const RELATION_TYPES = [
  'REQUIRES',
  'DEPENDS_ON',
  'IS_A',
  'PART_OF',
  'CONTRASTS_WITH',
  'USES',
  'APPLIES_TO',
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseDraftGraph(rawText: string): DraftGraphData {
  try {
    const parsed = JSON.parse(rawText);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const data = parsed as DraftGraphData;
      if (!Array.isArray(data.entities)) data.entities = [];
      if (!Array.isArray(data.topics)) data.topics = [];
      if (!Array.isArray(data.knowledge_relations)) data.knowledge_relations = [];
      return data;
    }
  } catch {
    // Return empty fallback structure
  }
  return { entities: [], topics: [], knowledge_relations: [] };
}

export function stringifyDraftGraph(graph: DraftGraphData): string {
  return JSON.stringify(graph, null, 2);
}

/**
 * Add a new knowledge entity to the draft graph.
 * Optionally assign it to a specified topic.
 */
export function addEntityToDraft(
  graph: DraftGraphData,
  params: {
    name: string;
    description?: string;
    definition?: string;
    topicName?: string;
  }
): DraftGraphData {
  const next = structuredClone(graph);
  if (!Array.isArray(next.entities)) next.entities = [];

  const trimmedName = params.name.trim();
  const newEntity: DraftEntity = {
    name: trimmedName,
    description: params.description?.trim() || '',
    definition: { content: params.definition?.trim() || '' },
    processes: [],
    exercises: [],
    examples: [],
    arguments: [],
  };

  next.entities.push(newEntity);

  // If topicName specified, associate concept to topic
  if (params.topicName && params.topicName.trim()) {
    const topicTarget = params.topicName.trim();
    if (!Array.isArray(next.topics)) next.topics = [];
    let foundTopic = next.topics.find(
      (t) => t.name.toLowerCase() === topicTarget.toLowerCase()
    );
    if (!foundTopic) {
      foundTopic = { name: topicTarget, summary: '', concepts_included: [] };
      next.topics.push(foundTopic);
    }
    if (!Array.isArray(foundTopic.concepts_included)) {
      foundTopic.concepts_included = [];
    }
    if (!foundTopic.concepts_included.includes(trimmedName)) {
      foundTopic.concepts_included.push(trimmedName);
    }
  }

  return next;
}

/**
 * Update an existing knowledge entity.
 * If the entity name changes, updates all occurrences in topics.concepts_included
 * and knowledge_relations (both source and target) to maintain relational integrity.
 */
export function updateEntityInDraft(
  graph: DraftGraphData,
  entityIndex: number,
  params: {
    name: string;
    description?: string;
    definition?: string;
  }
): DraftGraphData {
  const next = structuredClone(graph);
  if (!Array.isArray(next.entities) || !next.entities[entityIndex]) {
    return next;
  }

  const prevEntity = next.entities[entityIndex];
  const oldName = prevEntity.name;
  const newName = params.name.trim();

  prevEntity.name = newName;
  prevEntity.description = params.description?.trim() ?? prevEntity.description ?? '';
  if (typeof prevEntity.definition === 'object' && prevEntity.definition !== null) {
    prevEntity.definition = { content: params.definition?.trim() ?? '' };
  } else {
    prevEntity.definition = params.definition?.trim() ?? '';
  }

  // If name changed, rename occurrences across topics and relations
  if (oldName && newName && oldName.toLowerCase() !== newName.toLowerCase()) {
    if (Array.isArray(next.topics)) {
      for (const topic of next.topics) {
        if (Array.isArray(topic.concepts_included)) {
          topic.concepts_included = topic.concepts_included.map((concept) =>
            concept.trim().toLowerCase() === oldName.trim().toLowerCase()
              ? newName
              : concept
          );
        }
      }
    }

    if (Array.isArray(next.knowledge_relations)) {
      for (const rel of next.knowledge_relations) {
        if (rel.source.trim().toLowerCase() === oldName.trim().toLowerCase()) {
          rel.source = newName;
        }
        if (rel.target.trim().toLowerCase() === oldName.trim().toLowerCase()) {
          rel.target = newName;
        }
      }
    }
  }

  return next;
}

/**
 * Delete a knowledge entity and purge references from topics and relations.
 */
export function deleteEntityFromDraft(
  graph: DraftGraphData,
  entityIndex: number
): DraftGraphData {
  const next = structuredClone(graph);
  if (!Array.isArray(next.entities) || !next.entities[entityIndex]) {
    return next;
  }

  const targetName = next.entities[entityIndex].name;
  next.entities.splice(entityIndex, 1);

  // Clean from topics
  if (targetName && Array.isArray(next.topics)) {
    for (const topic of next.topics) {
      if (Array.isArray(topic.concepts_included)) {
        topic.concepts_included = topic.concepts_included.filter(
          (c) => c.trim().toLowerCase() !== targetName.trim().toLowerCase()
        );
      }
    }
  }

  // Clean from relations
  if (targetName && Array.isArray(next.knowledge_relations)) {
    next.knowledge_relations = next.knowledge_relations.filter(
      (rel) =>
        rel.source.trim().toLowerCase() !== targetName.trim().toLowerCase() &&
        rel.target.trim().toLowerCase() !== targetName.trim().toLowerCase()
    );
  }

  return next;
}

/**
 * Add a new knowledge relation between two entities.
 */
export function addRelationToDraft(
  graph: DraftGraphData,
  relation: {
    source: string;
    target: string;
    relation_type: string;
  }
): DraftGraphData {
  const next = structuredClone(graph);
  if (!Array.isArray(next.knowledge_relations)) next.knowledge_relations = [];

  const source = relation.source.trim();
  const target = relation.target.trim();
  const relation_type = (relation.relation_type.trim() || 'REQUIRES').toUpperCase();

  if (!source || !target || source.toLowerCase() === target.toLowerCase()) {
    return next;
  }

  // Prevent duplicates
  const exists = next.knowledge_relations.some(
    (r) =>
      r.source.toLowerCase() === source.toLowerCase() &&
      r.target.toLowerCase() === target.toLowerCase() &&
      r.relation_type.toUpperCase() === relation_type
  );

  if (!exists) {
    next.knowledge_relations.push({ source, target, relation_type });
  }

  return next;
}

/**
 * Delete a knowledge relation by index.
 */
export function deleteRelationFromDraft(
  graph: DraftGraphData,
  relationIndex: number
): DraftGraphData {
  const next = structuredClone(graph);
  if (
    Array.isArray(next.knowledge_relations) &&
    next.knowledge_relations[relationIndex]
  ) {
    next.knowledge_relations.splice(relationIndex, 1);
  }
  return next;
}

/**
 * Add a new topic to the draft graph.
 */
export function addTopicToDraft(
  graph: DraftGraphData,
  topic: {
    name: string;
    summary?: string;
    concepts_included?: string[];
  }
): DraftGraphData {
  const next = structuredClone(graph);
  if (!Array.isArray(next.topics)) next.topics = [];

  const name = topic.name.trim();
  if (!name) return next;

  const exists = next.topics.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    exists.summary = topic.summary?.trim() || exists.summary;
    if (topic.concepts_included) {
      exists.concepts_included = topic.concepts_included;
    }
  } else {
    next.topics.push({
      name,
      summary: topic.summary?.trim() || '',
      concepts_included: topic.concepts_included || [],
    });
  }

  return next;
}

/**
 * Delete a topic by index.
 */
export function deleteTopicFromDraft(
  graph: DraftGraphData,
  topicIndex: number
): DraftGraphData {
  const next = structuredClone(graph);
  if (Array.isArray(next.topics) && next.topics[topicIndex]) {
    next.topics.splice(topicIndex, 1);
  }
  return next;
}

/**
 * Sub-item mutations for processes, exercises, examples, arguments.
 */
export function addProcessToEntity(
  graph: DraftGraphData,
  entityIndex: number,
  process: { name: string; description?: string; steps?: string[] }
): DraftGraphData {
  const next = structuredClone(graph);
  const entity = next.entities?.[entityIndex];
  if (!entity) return next;

  if (!Array.isArray(entity.processes)) entity.processes = [];
  const steps: DraftProcessStep[] = (process.steps ?? []).map((action, idx) => ({
    action,
    step_number: idx + 1,
  }));

  entity.processes.push({
    name: process.name.trim(),
    description: process.description?.trim() || '',
    steps,
  });

  return next;
}

export function deleteProcessFromEntity(
  graph: DraftGraphData,
  entityIndex: number,
  processIndex: number
): DraftGraphData {
  const next = structuredClone(graph);
  const entity = next.entities?.[entityIndex];
  if (entity && Array.isArray(entity.processes) && entity.processes[processIndex]) {
    entity.processes.splice(processIndex, 1);
  }
  return next;
}

export function addExerciseToEntity(
  graph: DraftGraphData,
  entityIndex: number,
  exercise: { title: string; content?: string; steps?: string[] }
): DraftGraphData {
  const next = structuredClone(graph);
  const entity = next.entities?.[entityIndex];
  if (!entity) return next;

  if (!Array.isArray(entity.exercises)) entity.exercises = [];
  const steps: DraftExerciseStep[] = (exercise.steps ?? []).map((action, idx) => ({
    action,
    step_number: idx + 1,
  }));

  entity.exercises.push({
    title: exercise.title.trim(),
    content: exercise.content?.trim() || '',
    steps,
  });

  return next;
}

export function deleteExerciseFromEntity(
  graph: DraftGraphData,
  entityIndex: number,
  exerciseIndex: number
): DraftGraphData {
  const next = structuredClone(graph);
  const entity = next.entities?.[entityIndex];
  if (entity && Array.isArray(entity.exercises) && entity.exercises[exerciseIndex]) {
    entity.exercises.splice(exerciseIndex, 1);
  }
  return next;
}

export function addExampleToEntity(
  graph: DraftGraphData,
  entityIndex: number,
  example: { title: string; explanation?: string; code_snippet?: string }
): DraftGraphData {
  const next = structuredClone(graph);
  const entity = next.entities?.[entityIndex];
  if (!entity) return next;

  if (!Array.isArray(entity.examples)) entity.examples = [];
  entity.examples.push({
    title: example.title.trim(),
    explanation: example.explanation?.trim() || '',
    code_snippet: example.code_snippet?.trim() || '',
  });

  return next;
}

export function deleteExampleFromEntity(
  graph: DraftGraphData,
  entityIndex: number,
  exampleIndex: number
): DraftGraphData {
  const next = structuredClone(graph);
  const entity = next.entities?.[entityIndex];
  if (entity && Array.isArray(entity.examples) && entity.examples[exampleIndex]) {
    entity.examples.splice(exampleIndex, 1);
  }
  return next;
}

export function addArgumentToEntity(
  graph: DraftGraphData,
  entityIndex: number,
  argument: { hypothesis?: string; evidence?: string; conclusion?: string }
): DraftGraphData {
  const next = structuredClone(graph);
  const entity = next.entities?.[entityIndex];
  if (!entity) return next;

  if (!Array.isArray(entity.arguments)) entity.arguments = [];
  entity.arguments.push({
    hypothesis: argument.hypothesis?.trim() || '',
    evidence: argument.evidence?.trim() || '',
    conclusion: argument.conclusion?.trim() || '',
  });

  return next;
}

export function deleteArgumentFromEntity(
  graph: DraftGraphData,
  entityIndex: number,
  argumentIndex: number
): DraftGraphData {
  const next = structuredClone(graph);
  const entity = next.entities?.[entityIndex];
  if (entity && Array.isArray(entity.arguments) && entity.arguments[argumentIndex]) {
    entity.arguments.splice(argumentIndex, 1);
  }
  return next;
}

/**
 * Delete any node at a specific path (e.g. "entities/0", "entities/0/processes/1", "topics/2").
 */
export function deleteNodeByPath(
  graph: DraftGraphData,
  path: string
): DraftGraphData {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return graph;

  const [root, idxStr, subKey, subIdxStr] = parts;
  const idx = Number(idxStr);

  if (root === 'entities' && parts.length === 2 && !Number.isNaN(idx)) {
    return deleteEntityFromDraft(graph, idx);
  }

  if (root === 'topics' && parts.length === 2 && !Number.isNaN(idx)) {
    return deleteTopicFromDraft(graph, idx);
  }

  if (root === 'entities' && subKey && subIdxStr !== undefined) {
    const subIdx = Number(subIdxStr);
    if (!Number.isNaN(idx) && !Number.isNaN(subIdx)) {
      if (subKey === 'processes') return deleteProcessFromEntity(graph, idx, subIdx);
      if (subKey === 'exercises') return deleteExerciseFromEntity(graph, idx, subIdx);
      if (subKey === 'examples') return deleteExampleFromEntity(graph, idx, subIdx);
      if (subKey === 'arguments') return deleteArgumentFromEntity(graph, idx, subIdx);
    }
  }

  return graph;
}

export interface NodeFieldInfo {
  key: string;
  label: string;
  value: string;
  rows?: number;
}

/**
 * Universal field extractor for ANY node in the draft graph,
 * normalizing string vs object representations (e.g. definition, steps).
 */
export function getNodeFields(
  graph: DraftGraphData,
  path: string,
  kind: string
): { label: string; fields: NodeFieldInfo[] } {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { label: kind, fields: [] };

  const [root, idxStr, subKey, subIdxStr, deepKey, deepIdxStr] = parts;
  const idx = Number(idxStr);

  // 1. Topics
  if (root === 'topics' && !Number.isNaN(idx)) {
    const topic = graph.topics?.[idx];
    return {
      label: topic?.name || `Topic #${idx + 1}`,
      fields: [
        { key: 'name', label: 'Tên chủ đề', value: topic?.name || '', rows: 1 },
        { key: 'summary', label: 'Tóm tắt chủ đề', value: topic?.summary || '', rows: 3 },
      ],
    };
  }

  // 2. Entities
  if (root === 'entities' && !Number.isNaN(idx)) {
    const entity = graph.entities?.[idx];
    if (!entity) return { label: kind, fields: [] };

    // Definition node
    if (subKey === 'definition') {
      const defContent =
        typeof entity.definition === 'string'
          ? entity.definition
          : typeof entity.definition === 'object' && entity.definition !== null
            ? (entity.definition as { content?: string }).content || ''
            : '';
      return {
        label: `Định nghĩa của "${entity.name}"`,
        fields: [
          { key: 'content', label: 'Nội dung định nghĩa', value: defContent, rows: 4 },
        ],
      };
    }

    // Processes
    if (subKey === 'processes') {
      const pIdx = Number(subIdxStr);
      const proc = entity.processes?.[pIdx];
      if (!proc) return { label: kind, fields: [] };

      // ProcessStep node
      if (deepKey === 'steps') {
        const sIdx = Number(deepIdxStr);
        const step = proc.steps?.[sIdx];
        const actionText =
          typeof step === 'string'
            ? step
            : typeof step === 'object' && step !== null
              ? (step as { action?: string }).action || ''
              : '';
        return {
          label: `Bước ${sIdx + 1} của quy trình "${proc.name}"`,
          fields: [
            { key: 'action', label: 'Hành động / Thao tác bước', value: actionText, rows: 2 },
          ],
        };
      }

      return {
        label: proc.name || `Quy trình #${pIdx + 1}`,
        fields: [
          { key: 'name', label: 'Tên quy trình', value: proc.name || '', rows: 1 },
          { key: 'description', label: 'Mô tả quy trình', value: proc.description || '', rows: 3 },
        ],
      };
    }

    // Exercises
    if (subKey === 'exercises') {
      const eIdx = Number(subIdxStr);
      const ex = entity.exercises?.[eIdx];
      if (!ex) return { label: kind, fields: [] };

      // ExerciseStep node
      if (deepKey === 'steps') {
        const sIdx = Number(deepIdxStr);
        const step = ex.steps?.[sIdx];
        const actionText =
          typeof step === 'string'
            ? step
            : typeof step === 'object' && step !== null
              ? (step as { action?: string }).action || ''
              : '';
        return {
          label: `Bước ${sIdx + 1} của bài tập "${ex.title}"`,
          fields: [
            { key: 'action', label: 'Nội dung bước thực hiện', value: actionText, rows: 2 },
          ],
        };
      }

      return {
        label: ex.title || `Bài tập #${eIdx + 1}`,
        fields: [
          { key: 'title', label: 'Tiêu đề bài tập', value: ex.title || '', rows: 1 },
          { key: 'content', label: 'Nội dung / Đề bài', value: ex.content || '', rows: 3 },
        ],
      };
    }

    // Examples
    if (subKey === 'examples') {
      const xIdx = Number(subIdxStr);
      const item = entity.examples?.[xIdx];
      return {
        label: item?.title || `Ví dụ #${xIdx + 1}`,
        fields: [
          { key: 'title', label: 'Tiêu đề ví dụ', value: item?.title || '', rows: 1 },
          { key: 'explanation', label: 'Giải thích chi tiết', value: item?.explanation || '', rows: 3 },
          { key: 'code_snippet', label: 'Đoạn mã code minh họa', value: item?.code_snippet || '', rows: 4 },
        ],
      };
    }

    // Arguments
    if (subKey === 'arguments') {
      const aIdx = Number(subIdxStr);
      const item = entity.arguments?.[aIdx];
      return {
        label: item?.hypothesis || `Lập luận #${aIdx + 1}`,
        fields: [
          { key: 'hypothesis', label: 'Giả thuyết', value: item?.hypothesis || '', rows: 2 },
          { key: 'evidence', label: 'Bằng chứng', value: item?.evidence || '', rows: 3 },
          { key: 'conclusion', label: 'Kết luận', value: item?.conclusion || '', rows: 2 },
        ],
      };
    }

    // KnowledgeEntity node itself
    const defContent =
      typeof entity.definition === 'string'
        ? entity.definition
        : typeof entity.definition === 'object' && entity.definition !== null
          ? (entity.definition as { content?: string }).content || ''
          : '';

    return {
      label: entity.name || `Entity #${idx + 1}`,
      fields: [
        { key: 'name', label: 'Tên thực thể tri thức', value: entity.name || '', rows: 1 },
        { key: 'definition', label: 'Định nghĩa cốt lõi', value: defContent, rows: 3 },
        { key: 'description', label: 'Mô tả chi tiết', value: entity.description || '', rows: 2 },
      ],
    };
  }

  return { label: kind, fields: [] };
}

/**
 * Universal field updater for ANY node in the draft graph,
 * handling both string and object storage representations.
 */
export function updateNodeFieldByPath(
  graph: DraftGraphData,
  path: string,
  kind: string,
  field: string,
  value: string
): DraftGraphData {
  const next = structuredClone(graph);
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return next;

  const [root, idxStr, subKey, subIdxStr, deepKey, deepIdxStr] = parts;
  const idx = Number(idxStr);

  if (root === 'topics' && !Number.isNaN(idx)) {
    const topic = next.topics?.[idx];
    if (topic) {
      if (field === 'name') topic.name = value.trim();
      if (field === 'summary') topic.summary = value.trim();
    }
    return next;
  }

  if (root === 'entities' && !Number.isNaN(idx)) {
    const entity = next.entities?.[idx];
    if (!entity) return next;

    // Definition
    if (subKey === 'definition') {
      if (typeof entity.definition === 'object' && entity.definition !== null) {
        (entity.definition as { content: string }).content = value;
      } else {
        entity.definition = value;
      }
      return next;
    }

    // Processes
    if (subKey === 'processes') {
      const pIdx = Number(subIdxStr);
      const proc = entity.processes?.[pIdx];
      if (proc) {
        if (deepKey === 'steps') {
          const sIdx = Number(deepIdxStr);
          if (Array.isArray(proc.steps) && proc.steps[sIdx] !== undefined) {
            const step = proc.steps[sIdx];
            if (typeof step === 'object' && step !== null) {
              (step as { action: string }).action = value;
            } else {
              proc.steps[sIdx] = { action: value, step_number: sIdx + 1 };
            }
          }
        } else {
          if (field === 'name') proc.name = value.trim();
          if (field === 'description') proc.description = value;
        }
      }
      return next;
    }

    // Exercises
    if (subKey === 'exercises') {
      const eIdx = Number(subIdxStr);
      const ex = entity.exercises?.[eIdx];
      if (ex) {
        if (deepKey === 'steps') {
          const sIdx = Number(deepIdxStr);
          if (Array.isArray(ex.steps) && ex.steps[sIdx] !== undefined) {
            const step = ex.steps[sIdx];
            if (typeof step === 'object' && step !== null) {
              (step as { action: string }).action = value;
            } else {
              ex.steps[sIdx] = { action: value, step_number: sIdx + 1 };
            }
          }
        } else {
          if (field === 'title') ex.title = value.trim();
          if (field === 'content') ex.content = value;
        }
      }
      return next;
    }

    // Examples
    if (subKey === 'examples') {
      const xIdx = Number(subIdxStr);
      const item = entity.examples?.[xIdx];
      if (item) {
        if (field === 'title') item.title = value.trim();
        if (field === 'explanation') item.explanation = value;
        if (field === 'code_snippet') item.code_snippet = value;
      }
      return next;
    }

    // Arguments
    if (subKey === 'arguments') {
      const aIdx = Number(subIdxStr);
      const item = entity.arguments?.[aIdx];
      if (item) {
        if (field === 'hypothesis') item.hypothesis = value;
        if (field === 'evidence') item.evidence = value;
        if (field === 'conclusion') item.conclusion = value;
      }
      return next;
    }

    // Entity itself
    if (field === 'name') {
      return updateEntityInDraft(next, idx, {
        name: value,
        description: entity.description,
        definition:
          typeof entity.definition === 'string'
            ? entity.definition
            : entity.definition?.content,
      });
    }
    if (field === 'description') {
      entity.description = value;
      return next;
    }
    if (field === 'definition') {
      if (typeof entity.definition === 'object' && entity.definition !== null) {
        (entity.definition as { content: string }).content = value;
      } else {
        entity.definition = value;
      }
      return next;
    }
  }

  return next;
}
