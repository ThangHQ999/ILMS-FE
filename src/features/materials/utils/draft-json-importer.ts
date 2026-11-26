/**
 * Helper utilities for parsing, validating, and merging JSON snippets into Draft Knowledge Graph.
 * Supports Draw.io-style "Insert from JSON Code":
 * - Single Entity: { "name": "...", "description": "..." }
 * - Array of Entities: [ { "name": "...", "processes": [...] }, ... ]
 * - Full or partial graph: { "entities": [...], "topics": [...], "knowledge_relations": [...] }
 */

import type { DraftEntity, DraftGraphData, DraftTopic, DraftRelation } from './draft-graph-crud';

export interface ParsedJsonImportPayload {
  entities: DraftEntity[];
  topics: DraftTopic[];
  knowledge_relations: DraftRelation[];
}

export interface JsonImportValidation {
  isValid: boolean;
  errorMessage?: string;
  payload?: ParsedJsonImportPayload;
  entitiesCount: number;
  topicsCount: number;
  relationsCount: number;
}

export const SAMPLE_INSERT_ENTITIES_JSON = JSON.stringify(
  [
    {
      name: 'Thuật toán Tìm kiếm Nhị phân (Binary Search)',
      description: 'Thuật toán tìm kiếm phần tử trong mảng đã sắp xếp với độ phức tạp thời gian O(log n).',
      definition: 'Tìm kiếm nhị phân là giải thuật tìm kiếm hiệu quả dựa trên nguyên lý chia đôi không gian tìm kiếm ở mỗi bước.',
      processes: [
        {
          name: 'Các bước thực thi Binary Search',
          description: 'Quy trình lặp để thu hẹp khoảng tìm kiếm',
          steps: [
            { action: 'Thiết lập chỉ số biên trái left = 0, biên phải right = n - 1', step_number: 1 },
            { action: 'Tính điểm giữa mid = left + (right - left) // 2', step_number: 2 },
            { action: 'So sánh giá trị tại arr[mid] với khóa tìm kiếm X', step_number: 3 },
            { action: 'Nếu bằng nhau trả về mid; nếu arr[mid] < X gán left = mid + 1, ngược lại gán right = mid - 1', step_number: 4 },
          ],
        },
      ],
      exercises: [
        {
          title: 'Cài đặt Binary Search đệ quy và lặp',
          content: 'Viết chương trình tìm kiếm vị trí của số K trong mảng nguyên tăng dần gồm 10,000 phần tử.',
        },
      ],
      examples: [
        {
          title: 'Tìm số 42 trong dãy số chẵn',
          explanation: 'Mảng [2, 4, 8, 16, 32, 42, 64]. Bước 1 chọn 16 (nhỏ hơn 42) -> dịch sang nửa phải.',
        },
      ],
    },
    {
      name: 'Thuật toán Tìm kiếm Tuyến tính (Linear Search)',
      description: 'Thuật toán tìm kiếm tuần tự từng phần tử từ đầu đến cuối mảng với độ phức tạp O(n).',
      definition: 'Tìm kiếm tuyến tính kiểm tra tuần tự mọi phần tử cho đến khi tìm thấy khóa cần tìm hoặc hết mảng.',
    },
  ],
  null,
  2
);

/**
 * Parse any raw JSON string (single entity, array of entities, or full graph object).
 */
export function validateAndParseImportJson(jsonText: string): JsonImportValidation {
  const trimmed = (jsonText || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Vui lòng dán mã JSON cần chèn vào ô nhập liệu.',
      entitiesCount: 0,
      topicsCount: 0,
      relationsCount: 0,
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch (err) {
    return {
      isValid: false,
      errorMessage: `Cú pháp JSON không hợp lệ: ${(err as Error).message}`,
      entitiesCount: 0,
      topicsCount: 0,
      relationsCount: 0,
    };
  }

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errorMessage: 'Dữ liệu JSON phải là một đối tượng (Object) hoặc danh sách (Array).',
      entitiesCount: 0,
      topicsCount: 0,
      relationsCount: 0,
    };
  }

  const payload: ParsedJsonImportPayload = {
    entities: [],
    topics: [],
    knowledge_relations: [],
  };

  // Case 1: Array of entities -> [ { name: "...", ... }, ... ]
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
        payload.entities.push(item as DraftEntity);
      }
    }
    if (payload.entities.length === 0) {
      return {
        isValid: false,
        errorMessage: 'Mảng JSON không chứa thực thể hợp lệ (mỗi phần tử phải có trường "name").',
        entitiesCount: 0,
        topicsCount: 0,
        relationsCount: 0,
      };
    }
  } else {
    // Case 2: Object with "entities", "topics", "knowledge_relations"
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.entities)) {
      for (const item of obj.entities) {
        if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
          payload.entities.push(item as DraftEntity);
        }
      }
    }

    if (Array.isArray(obj.topics)) {
      for (const item of obj.topics) {
        if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
          payload.topics.push(item as DraftTopic);
        }
      }
    }

    if (Array.isArray(obj.knowledge_relations)) {
      for (const item of obj.knowledge_relations) {
        if (
          item &&
          typeof item === 'object' &&
          'source' in item &&
          'target' in item &&
          typeof item.source === 'string' &&
          typeof item.target === 'string'
        ) {
          payload.knowledge_relations.push(item as DraftRelation);
        }
      }
    }

    // Case 3: Single entity object -> { "name": "...", "description": "..." }
    if (
      payload.entities.length === 0 &&
      payload.topics.length === 0 &&
      typeof obj.name === 'string' &&
      obj.name.trim().length > 0
    ) {
      payload.entities.push(obj as unknown as DraftEntity);
    }
  }

  const entitiesCount = payload.entities.length;
  const topicsCount = payload.topics.length;
  const relationsCount = payload.knowledge_relations.length;

  if (entitiesCount === 0 && topicsCount === 0 && relationsCount === 0) {
    return {
      isValid: false,
      errorMessage: 'Không tìm thấy thực thể hoặc chủ đề hợp lệ trong mã JSON (cần có ít nhất một mục có trường "name").',
      entitiesCount: 0,
      topicsCount: 0,
      relationsCount: 0,
    };
  }

  return {
    isValid: true,
    payload,
    entitiesCount,
    topicsCount,
    relationsCount,
  };
}

/**
 * Merge newly imported JSON items into existing DraftGraphData.
 */
export function mergeJsonImportIntoGraph(
  currentGraph: DraftGraphData,
  imported: ParsedJsonImportPayload,
  mode: 'merge' | 'replace' = 'merge'
): DraftGraphData {
  if (mode === 'replace') {
    return {
      topics: imported.topics,
      entities: imported.entities,
      knowledge_relations: imported.knowledge_relations,
    };
  }

  const next: DraftGraphData = structuredClone(currentGraph);
  if (!Array.isArray(next.entities)) next.entities = [];
  if (!Array.isArray(next.topics)) next.topics = [];
  if (!Array.isArray(next.knowledge_relations)) next.knowledge_relations = [];

  // 1. Merge entities (avoid duplicate names by updating or appending)
  const existingEntityNames = new Set(next.entities.map((e) => e.name.toLowerCase()));
  for (const newEnt of imported.entities) {
    const key = newEnt.name.toLowerCase();
    if (!existingEntityNames.has(key)) {
      next.entities.push(newEnt);
      existingEntityNames.add(key);
    } else {
      // Find and merge sub-arrays (processes, exercises...)
      const target = next.entities.find((e) => e.name.toLowerCase() === key);
      if (target) {
        if (newEnt.description && !target.description) target.description = newEnt.description;
        if (newEnt.definition && !target.definition) target.definition = newEnt.definition;
        if (Array.isArray(newEnt.processes)) {
          target.processes = [...(target.processes || []), ...newEnt.processes];
        }
        if (Array.isArray(newEnt.exercises)) {
          target.exercises = [...(target.exercises || []), ...newEnt.exercises];
        }
        if (Array.isArray(newEnt.examples)) {
          target.examples = [...(target.examples || []), ...newEnt.examples];
        }
        if (Array.isArray(newEnt.arguments)) {
          target.arguments = [...(target.arguments || []), ...newEnt.arguments];
        }
      }
    }
  }

  // 2. Merge topics
  const existingTopicNames = new Set(next.topics.map((t) => t.name.toLowerCase()));
  for (const newTop of imported.topics) {
    if (!existingTopicNames.has(newTop.name.toLowerCase())) {
      next.topics.push(newTop);
      existingTopicNames.add(newTop.name.toLowerCase());
    }
  }

  // 3. Merge relations
  const existingRelKeys = new Set(
    next.knowledge_relations.map((r) => `${r.source.toLowerCase()}->${r.target.toLowerCase()}`)
  );
  for (const rel of imported.knowledge_relations) {
    const relKey = `${rel.source.toLowerCase()}->${rel.target.toLowerCase()}`;
    if (!existingRelKeys.has(relKey)) {
      next.knowledge_relations.push(rel);
      existingRelKeys.add(relKey);
    }
  }

  return next;
}
