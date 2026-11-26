import {
  importKnowledgeGraphRequestSchema,
  type ImportKnowledgeGraphRequestDTO,
} from '../knowledge-graph.schema';

export interface ValidationErrorItem {
  id: string;
  type: 'syntax' | 'schema' | 'reference' | 'cycle';
  title: string;
  message: string;
  field?: string;
  detail?: string;
}

export interface ValidationResult {
  isValid: boolean;
  parsedData: ImportKnowledgeGraphRequestDTO | null;
  errors: ValidationErrorItem[];
  warnings: string[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    categories: string[];
    levels: Record<string, number>;
  };
}

export const SAMPLE_IMPORT_GRAPH_JSON = JSON.stringify(
  {
    title: 'Cây tri thức Cấu trúc dữ liệu & Giải thuật',
    description:
      'Đồ thị khái niệm môn học từ cơ bản đến nâng cao bao gồm Mảng, Ngăn xếp, Hàng đợi, Cây và Đồ thị',
    nodes: [
      {
        id: 'concept-array-basics',
        label: 'Mảng và Con trỏ cơ bản',
        level: 'BEGINNER',
        category: 'Cấu trúc dữ liệu tuyến tính',
        description: 'Khái niệm ô nhớ liên tiếp, cấp phát bộ nhớ động và con trỏ',
        prerequisites: [],
      },
      {
        id: 'concept-linked-list',
        label: 'Danh sách liên kết (Linked List)',
        level: 'BEGINNER',
        category: 'Cấu trúc dữ liệu tuyến tính',
        description: 'Danh sách liên kết đơn, danh sách liên kết đôi và node trỏ',
        prerequisites: ['concept-array-basics'],
      },
      {
        id: 'concept-stack-queue',
        label: 'Ngăn xếp & Hàng đợi (Stack & Queue)',
        level: 'BEGINNER',
        category: 'Cấu trúc dữ liệu tuyến tính',
        description: 'Nguyên lý LIFO, FIFO và ứng dụng trong đệ quy, duyệt đồ thị',
        prerequisites: ['concept-linked-list'],
      },
      {
        id: 'concept-tree-basics',
        label: 'Cây nhị phân cơ bản (Binary Tree)',
        level: 'INTERMEDIATE',
        category: 'Cấu trúc dữ liệu phân cấp',
        description: 'Định nghĩa cây nhị phân, duyệt tiền thứ tự, trung thứ tự và hậu thứ tự',
        prerequisites: ['concept-linked-list'],
      },
      {
        id: 'concept-bst',
        label: 'Cây tìm kiếm nhị phân (BST)',
        level: 'INTERMEDIATE',
        category: 'Cấu trúc dữ liệu phân cấp',
        description: 'Tính chất BST, thao tác chèn, xóa và tìm kiếm trong thời gian O(log N)',
        prerequisites: ['concept-tree-basics'],
      },
      {
        id: 'concept-avl-tree',
        label: 'Cây tự cân bằng AVL & Cây Đỏ-Đen',
        level: 'ADVANCED',
        category: 'Cấu trúc dữ liệu phân cấp',
        description: 'Kỹ thuật xoay cây cân bằng để đảm bảo chiều cao luôn là O(log N)',
        prerequisites: ['concept-bst'],
      },
      {
        id: 'concept-graph-basics',
        label: 'Đồ thị và Ma trận kề',
        level: 'INTERMEDIATE',
        category: 'Đồ thị & Mạng lưới',
        description: 'Biểu diễn đồ thị bằng ma trận kề, danh sách kề và danh sách cạnh',
        prerequisites: ['concept-array-basics', 'concept-linked-list'],
      },
      {
        id: 'concept-bfs-dfs',
        label: 'Thuật toán Duyệt BFS & DFS',
        level: 'INTERMEDIATE',
        category: 'Thuật toán đồ thị',
        description: 'Duyệt theo chiều rộng dùng Hàng đợi, duyệt theo chiều sâu dùng Ngăn xếp',
        prerequisites: ['concept-graph-basics', 'concept-stack-queue'],
      },
    ],
    edges: [
      {
        source: 'concept-array-basics',
        target: 'concept-linked-list',
        relation: 'PREREQUISITE',
      },
      {
        source: 'concept-linked-list',
        target: 'concept-stack-queue',
        relation: 'PREREQUISITE',
      },
      {
        source: 'concept-linked-list',
        target: 'concept-tree-basics',
        relation: 'PREREQUISITE',
      },
      {
        source: 'concept-tree-basics',
        target: 'concept-bst',
        relation: 'PREREQUISITE',
      },
      {
        source: 'concept-bst',
        target: 'concept-avl-tree',
        relation: 'EXTENDS',
      },
      {
        source: 'concept-array-basics',
        target: 'concept-graph-basics',
        relation: 'PREREQUISITE',
      },
      {
        source: 'concept-graph-basics',
        target: 'concept-bfs-dfs',
        relation: 'PREREQUISITE',
      },
      {
        source: 'concept-stack-queue',
        target: 'concept-bfs-dfs',
        relation: 'REQUIRES',
      },
    ],
  },
  null,
  2
);

export const IMPORT_SCHEMA_DOCUMENTATION = [
  {
    field: 'title',
    type: 'string (bắt buộc)',
    description: 'Tên cây tri thức môn học (VD: Cây tri thức Cấu trúc dữ liệu & Giải thuật).',
    example: '"Cây tri thức Cấu trúc dữ liệu & Giải thuật"',
  },
  {
    field: 'description',
    type: 'string (tùy chọn)',
    description: 'Mô tả khái quát phạm vi kiến thức và các chủ đề bao hàm.',
    example: '"Bao quát các khái niệm mảng, danh sách, cây, đồ thị..."',
  },
  {
    field: 'nodes',
    type: 'array (tối thiểu 1)',
    description: 'Danh sách các khái niệm / thực thể tri thức cần đưa vào đồ thị.',
    example: '[{ "id": "...", "label": "...", "level": "..." }]',
  },
  {
    field: 'nodes[].id',
    type: 'string (duy nhất)',
    description: 'Mã định danh duy nhất của khái niệm (chữ thường, gạch nối, không dấu).',
    example: '"concept-linked-list"',
  },
  {
    field: 'nodes[].label',
    type: 'string (bắt buộc)',
    description: 'Tên hiển thị sư phạm của khái niệm tri thức.',
    example: '"Danh sách liên kết (Linked List)"',
  },
  {
    field: 'nodes[].level',
    type: '"BEGINNER" | "INTERMEDIATE" | "ADVANCED"',
    description: 'Mức độ khó của khái niệm để phục vụ lộ trình học tập thích ứng.',
    example: '"BEGINNER"',
  },
  {
    field: 'nodes[].category',
    type: 'string (tùy chọn)',
    description: 'Chủ đề hoặc nhóm phân loại kiến thức.',
    example: '"Cấu trúc dữ liệu tuyến tính"',
  },
  {
    field: 'nodes[].description',
    type: 'string (tùy chọn)',
    description: 'Định nghĩa cốt lõi và nội dung sư phạm giải thích khái niệm.',
    example: '"Khái niệm ô nhớ liên tiếp, cấp phát động..."',
  },
  {
    field: 'nodes[].prerequisites',
    type: 'string[] (danh sách ID)',
    description: 'Danh sách ID các khái niệm tiên quyết cần học trước.',
    example: '["concept-array-basics"]',
  },
  {
    field: 'edges',
    type: 'array (tùy chọn)',
    description: 'Danh sách các liên kết có hướng kết nối giữa 2 khái niệm.',
    example: '[{ "source": "A", "target": "B", "relation": "PREREQUISITE" }]',
  },
  {
    field: 'edges[].source',
    type: 'string (bắt buộc)',
    description: 'ID của nút nguồn (nút xuất phát).',
    example: '"concept-array-basics"',
  },
  {
    field: 'edges[].target',
    type: 'string (bắt buộc)',
    description: 'ID của nút đích (nút tiếp nhận).',
    example: '"concept-linked-list"',
  },
  {
    field: 'edges[].relation',
    type: 'string (tùy chọn)',
    description: 'Loại quan hệ: PREREQUISITE (Tiên quyết), REQUIRES, EXTENDS, RELATES_TO...',
    example: '"PREREQUISITE"',
  },
];

/**
 * Detects cycles in a directed graph using Depth-First Search with 3-color states:
 * 0: Unvisited (White), 1: Visiting in current recursion stack (Gray), 2: Visited (Black)
 * Returns the first cycle path found (e.g. ['A', 'B', 'C', 'A']) or null if acyclic (valid DAG).
 */
function findDirectedCycle(
  nodeIds: string[],
  adjList: Map<string, string[]>
): string[] | null {
  const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
  const parent = new Map<string, string>();

  for (const id of nodeIds) {
    visited.set(id, 0);
  }

  for (const startNode of nodeIds) {
    if (visited.get(startNode) !== 0) continue;

    const stack: { node: string; neighborIdx: number }[] = [
      { node: startNode, neighborIdx: 0 },
    ];
    visited.set(startNode, 1);

    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      const neighbors = adjList.get(top.node) ?? [];

      if (top.neighborIdx < neighbors.length) {
        const next = neighbors[top.neighborIdx];
        top.neighborIdx++;

        const nextState = visited.get(next) ?? 0;
        if (nextState === 1) {
          // Detected cycle! Trace cycle back from top.node to next
          const cycle: string[] = [next, top.node];
          let curr = top.node;
          while (parent.has(curr) && parent.get(curr) !== next) {
            curr = parent.get(curr)!;
            cycle.push(curr);
          }
          cycle.push(next);
          return cycle.reverse();
        }

        if (nextState === 0) {
          visited.set(next, 1);
          parent.set(next, top.node);
          stack.push({ node: next, neighborIdx: 0 });
        }
      } else {
        visited.set(top.node, 2);
        stack.pop();
      }
    }
  }

  return null;
}

/**
 * Real-time 4-tier validator for Import Knowledge Graph JSON payloads.
 */
export function validateImportGraphJson(rawText: string): ValidationResult {
  const errors: ValidationErrorItem[] = [];
  const warnings: string[] = [];

  const emptyStats = {
    nodeCount: 0,
    edgeCount: 0,
    categories: [],
    levels: { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 },
  };

  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      isValid: false,
      parsedData: null,
      errors: [
        {
          id: 'err-empty',
          type: 'syntax',
          title: 'Nội dung JSON đang để trống',
          message: 'Vui lòng dán hoặc nhập cấu trúc JSON của đồ thị tri thức.',
          detail: 'Bạn có thể bấm "Nạp dữ liệu mẫu" ở thanh công cụ để xem định dạng chuẩn.',
        },
      ],
      warnings: [],
      stats: emptyStats,
    };
  }

  // Tier 1: Syntax Parsing
  let parsedRaw: unknown = null;
  try {
    parsedRaw = JSON.parse(trimmed);
  } catch (err) {
    const syntaxMsg = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      parsedData: null,
      errors: [
        {
          id: 'err-syntax',
          type: 'syntax',
          title: 'Lỗi cú pháp JSON (Syntax Error)',
          message: 'Dữ liệu không đúng định dạng JSON hợp lệ.',
          detail: syntaxMsg,
        },
      ],
      warnings: [],
      stats: emptyStats,
    };
  }

  // Tier 2: Schema Validation via Zod
  const zodResult = importKnowledgeGraphRequestSchema.safeParse(parsedRaw);
  if (!zodResult.success) {
    zodResult.error.issues.forEach((issue, idx) => {
      const fieldPath = issue.path.join('.');
      errors.push({
        id: `err-schema-${idx}`,
        type: 'schema',
        title: `Lỗi cấu trúc trường "${fieldPath || 'root'}"`,
        message: issue.message,
        field: fieldPath,
        detail: `Quy tắc vi phạm: ${issue.code}`,
      });
    });
  }

  const data = (parsedRaw as Partial<ImportKnowledgeGraphRequestDTO>) || {};
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const edges = Array.isArray(data.edges) ? data.edges : [];

  // Tier 3: Reference Integrity & Duplicate ID Checks
  const nodeIds = new Set<string>();
  const duplicateIds = new Set<string>();

  nodes.forEach((n, idx) => {
    if (!n || typeof n !== 'object') return;
    const nid = (n.id || '').trim();
    if (!nid) {
      errors.push({
        id: `err-node-noid-${idx}`,
        type: 'schema',
        title: `Nút thứ #${idx + 1} chưa có ID`,
        message: 'Mỗi khái niệm phải có thuộc tính "id" duy nhất (ví dụ: "concept-array").',
      });
      return;
    }

    if (nodeIds.has(nid)) {
      duplicateIds.add(nid);
    } else {
      nodeIds.add(nid);
    }
  });

  if (duplicateIds.size > 0) {
    duplicateIds.forEach((dupId) => {
      errors.push({
        id: `err-dup-${dupId}`,
        type: 'reference',
        title: 'Trùng lặp ID nút tri thức',
        message: `ID "${dupId}" xuất hiện nhiều hơn 1 lần trong danh sách nodes. Mỗi node phải có ID duy nhất.`,
        field: 'nodes.id',
      });
    });
  }

  // Check Edges Broken References
  const adjList = new Map<string, string[]>();
  nodeIds.forEach((id) => adjList.set(id, []));

  edges.forEach((edge, idx) => {
    if (!edge || typeof edge !== 'object') return;
    const src = (edge.source || '').trim();
    const tgt = (edge.target || '').trim();

    if (!src) {
      errors.push({
        id: `err-edge-nosrc-${idx}`,
        type: 'reference',
        title: `Liên kết #${idx + 1} thiếu nút nguồn (source)`,
        message: 'Thuộc tính "source" là bắt buộc trong mỗi liên kết.',
      });
    } else if (!nodeIds.has(src)) {
      errors.push({
        id: `err-edge-badsrc-${idx}`,
        type: 'reference',
        title: `Nút nguồn không tồn tại trong liên kết #${idx + 1}`,
        message: `Nút nguồn "${src}" không có trong danh sách nodes.`,
        field: `edges[${idx}].source`,
      });
    }

    if (!tgt) {
      errors.push({
        id: `err-edge-notgt-${idx}`,
        type: 'reference',
        title: `Liên kết #${idx + 1} thiếu nút đích (target)`,
        message: 'Thuộc tính "target" là bắt buộc trong mỗi liên kết.',
      });
    } else if (!nodeIds.has(tgt)) {
      errors.push({
        id: `err-edge-badtgt-${idx}`,
        type: 'reference',
        title: `Nút đích không tồn tại trong liên kết #${idx + 1}`,
        message: `Nút đích "${tgt}" không có trong danh sách nodes.`,
        field: `edges[${idx}].target`,
      });
    }

    if (src && tgt && src.toLowerCase() === tgt.toLowerCase()) {
      errors.push({
        id: `err-edge-self-${idx}`,
        type: 'cycle',
        title: `Tự liên kết vòng kín ở liên kết #${idx + 1}`,
        message: `Nút "${src}" không thể tự tạo liên kết tới chính nó.`,
        field: `edges[${idx}]`,
      });
    }

    if (src && tgt && nodeIds.has(src) && nodeIds.has(tgt) && src !== tgt) {
      const neighbors = adjList.get(src) ?? [];
      neighbors.push(tgt);
      adjList.set(src, neighbors);
    }
  });

  // Check Prerequisites in nodes
  nodes.forEach((n, idx) => {
    if (!n || !Array.isArray(n.prerequisites)) return;
    n.prerequisites.forEach((pId) => {
      const trimmedPId = (pId || '').trim();
      if (trimmedPId && !nodeIds.has(trimmedPId)) {
        errors.push({
          id: `err-prereq-${idx}-${trimmedPId}`,
          type: 'reference',
          title: `Khái niệm tiên quyết không tồn tại ở node "${n.label || n.id}"`,
          message: `ID tiên quyết "${trimmedPId}" được khai báo trong "prerequisites" nhưng không có trong danh sách nodes.`,
          field: `nodes[${idx}].prerequisites`,
        });
      } else if (trimmedPId && nodeIds.has(trimmedPId) && n.id && trimmedPId !== n.id) {
        // Also register prerequisite edge in adjList for cycle checking (Prerequisite A -> Node B)
        const neighbors = adjList.get(trimmedPId) ?? [];
        if (!neighbors.includes(n.id)) {
          neighbors.push(n.id);
          adjList.set(trimmedPId, neighbors);
        }
      }
    });
  });

  // Tier 4: DAG Cycle Detection
  if (nodeIds.size > 0 && errors.length === 0) {
    const cycle = findDirectedCycle(Array.from(nodeIds), adjList);
    if (cycle && cycle.length > 0) {
      const cycleDisplay = cycle.join(' ➔ ');
      errors.push({
        id: 'err-cycle-detected',
        type: 'cycle',
        title: 'Phát hiện Chu trình Vòng lặp Tiên quyết (DAG Cycle Violation)',
        message: `Đồ thị tri thức bắt buộc phải là đồ thị có hướng không chu trình (DAG). Đã phát hiện vòng lặp kín giữa các khái niệm: ${cycleDisplay}.`,
        detail: 'Vui lòng ngắt bớt liên kết ngược để đảm bảo lộ trình học tập không bị vòng tròn bất tận.',
      });
    }
  }

  // Compute Statistics
  const categories = Array.from(
    new Set(nodes.map((n) => (n?.category || 'Chung').trim()).filter(Boolean))
  );
  const levelsCount = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 };
  nodes.forEach((n) => {
    const lvl = (n?.level || 'BEGINNER').toUpperCase();
    if (lvl in levelsCount) {
      levelsCount[lvl as keyof typeof levelsCount]++;
    }
  });

  // Warnings (Non-blocking)
  if (nodes.length > 0 && edges.length === 0) {
    warnings.push('Đồ thị hiện chưa có liên kết nào giữa các nút. Bạn có thể bổ sung danh sách "edges" để tạo mối quan hệ giữa các khái niệm.');
  }

  const isValid = errors.length === 0 && zodResult.success;
  const parsedData = isValid ? zodResult.data : null;

  return {
    isValid,
    parsedData,
    errors,
    warnings,
    stats: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      categories,
      levels: levelsCount,
    },
  };
}
