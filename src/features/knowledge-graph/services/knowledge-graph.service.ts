import {
  KnowledgeNodeData,
  KnowledgeEdgeData,
  ShortestPathResult,
  KnowledgeGraphStats,
} from '../types';

export const mockKnowledgeNodes: KnowledgeNodeData[] = [
  {
    id: 'seg-tree',
    label: 'Segment Tree',
    sublabel: 'Cây phân đoạn',
    category: 'ds',
    status: 'learning',
    masteryScore: 88,
    complexity: { time: 'O(log N)', space: 'O(4N)' },
    description:
      'Cấu trúc dữ liệu cây nhị phân lưu trữ thông tin các đoạn con trên một mảng tĩnh hoặc động. Cho phép giải quyết bài toán RMQ và cập nhật khoảng trong O(log N).',
    icon: 'account_tree',
    isCenterpiece: true,
    relatedCount: 5,
    prerequisites: ['bst', 'prefix-sum'],
    successors: ['lazy-prop', 'rmq', 'plo-04'],
  },
  {
    id: 'bst',
    label: 'Binary Search Tree',
    sublabel: 'Cây nhị phân tìm kiếm',
    category: 'ds',
    status: 'mastered',
    masteryScore: 92,
    complexity: { time: 'O(log N)', space: 'O(N)' },
    description:
      'Cây nhị phân tìm kiếm cơ bản, tổ chức khóa tăng dần, hỗ trợ tra cứu, chèn và xóa dữ liệu hiệu quả.',
    icon: 'park',
    relatedCount: 3,
    prerequisites: [],
    successors: ['seg-tree', 'avl'],
  },
  {
    id: 'prefix-sum',
    label: 'Prefix Sum Array',
    sublabel: 'Mảng cộng dồn',
    category: 'ds',
    status: 'mastered',
    masteryScore: 100,
    complexity: { time: 'O(1) Query', space: 'O(N)' },
    description:
      'Kỹ thuật tiền xử lý mảng giúp tính tổng đoạn con bất kỳ trong độ phức tạp hằng số O(1). Nền tảng tư duy trước khi học Cây phân đoạn.',
    icon: 'view_list',
    relatedCount: 2,
    prerequisites: [],
    successors: ['seg-tree', 'fenwick'],
  },
  {
    id: 'lazy-prop',
    label: 'Lazy Propagation',
    sublabel: 'Lan truyền trễ',
    category: 'algo',
    status: 'learning',
    masteryScore: 72,
    complexity: { time: 'O(log N) Update', space: 'O(4N)' },
    description:
      'Kỹ thuật tối ưu hóa then chốt: trì hoãn việc cập nhật các nút con cho đến khi thực sự cần truy vấn, giảm thời gian Range Update từ O(N) xuống O(log N).',
    icon: 'flash_on',
    relatedCount: 3,
    prerequisites: ['seg-tree'],
    successors: ['dijkstra'],
  },
  {
    id: 'rmq',
    label: 'Range Minimum Query',
    sublabel: 'RMQ ICPC 2024',
    category: 'icpc',
    status: 'mastered',
    masteryScore: 100,
    complexity: { time: '< 1.0s / 256MB', space: 'O(N log N)' },
    description:
      'Bài toán tìm phần tử nhỏ nhất trong đoạn truy vấn bất kỳ, xuất hiện liên tục trong các đề thi ICPC National & Regional.',
    icon: 'terminal',
    relatedCount: 3,
    prerequisites: ['seg-tree'],
    successors: ['sparse-table'],
  },
  {
    id: 'plo-04',
    label: 'PLO 04: Tối ưu hoá truy vấn',
    sublabel: 'Chuẩn đầu ra PLO',
    category: 'plo',
    status: 'mastered',
    masteryScore: 85,
    complexity: { time: 'Chuẩn A+', space: 'Bậc 4' },
    description:
      'Chuẩn năng lực đầu ra ngành CS: Khả năng phân tích và tối ưu hóa độ phức tạp thời gian xử lý truy vấn dữ liệu lớn.',
    icon: 'workspace_premium',
    relatedCount: 2,
    prerequisites: ['seg-tree'],
    successors: ['plo-02'],
  },
  {
    id: 'avl',
    label: 'AVL Tree',
    sublabel: 'Cây cân bằng AVL',
    category: 'ds',
    status: 'mastered',
    masteryScore: 80,
    complexity: { time: 'O(log N)', space: 'O(N)' },
    description:
      'Cây nhị phân tìm kiếm tự cân bằng với hệ số chênh lệch độ cao giữa cây con trái và phải không vượt quá 1.',
    icon: 'account_tree',
    relatedCount: 2,
    prerequisites: ['bst'],
    successors: ['red-black'],
  },
  {
    id: 'trie',
    label: 'Prefix Trie',
    sublabel: 'Cây tiền tố Trie',
    category: 'ds',
    status: 'mastered',
    masteryScore: 90,
    complexity: { time: 'O(L)', space: 'O(26 * N)' },
    description:
      'Cấu trúc cây tiền tố hỗ trợ tra cứu và so khớp chuỗi ký tự cực nhanh theo độ dài xâu L.',
    icon: 'text_fields',
    relatedCount: 2,
    prerequisites: ['bst'],
    successors: ['kmp'],
  },
  {
    id: 'dsu',
    label: 'Disjoint Set Union',
    sublabel: 'Tập hợp rời DSU',
    category: 'ds',
    status: 'mastered',
    masteryScore: 95,
    complexity: { time: 'O(α(N))', space: 'O(N)' },
    description:
      'Cấu trúc dữ liệu quản lý các tập hợp rời rạc với hai thao tác Find và Union tối ưu bằng nén đường đi và gộp theo rank.',
    icon: 'device_hub',
    relatedCount: 3,
    prerequisites: ['prefix-sum'],
    successors: ['topo-sort'],
  },
  {
    id: 'dijkstra',
    label: 'Dijkstra Algorithm',
    sublabel: 'Đường đi ngắn nhất',
    category: 'algo',
    status: 'mastered',
    masteryScore: 88,
    complexity: { time: 'O(E log V)', space: 'O(V + E)' },
    description:
      'Thuật toán tìm đường đi ngắn nhất từ một đỉnh nguồn đến các đỉnh còn lại trên đồ thị có trọng số không âm sử dụng hàng đợi ưu tiên.',
    icon: 'alt_route',
    relatedCount: 3,
    prerequisites: ['lazy-prop'],
    successors: ['floyd'],
  },
  {
    id: 'knapsack',
    label: 'Knapsack 0/1 DP',
    sublabel: 'Quy hoạch động Cái túi',
    category: 'icpc',
    status: 'learning',
    masteryScore: 65,
    complexity: { time: 'O(N * W)', space: 'O(W)' },
    description:
      'Bài toán tối ưu hóa kinh điển: chọn các đồ vật có trọng lượng và giá trị sao cho tổng trọng lượng không vượt quá W và giá trị lớn nhất.',
    icon: 'backpack',
    relatedCount: 2,
    prerequisites: ['rmq'],
    successors: ['bitmask'],
  },
  {
    id: 'plo-02',
    label: 'PLO 02: Độ phức tạp',
    sublabel: 'Đánh giá O(log N)',
    category: 'plo',
    status: 'mastered',
    masteryScore: 90,
    complexity: { time: 'Đạt chuẩn', space: 'Bậc 3' },
    description:
      'Đánh giá và chứng minh tính đúng đắn, độ phức tạp tiệm cận không gian và thời gian của thuật toán phân rã.',
    icon: 'military_tech',
    relatedCount: 2,
    prerequisites: ['plo-04'],
    successors: [],
  },
  {
    id: 'fenwick',
    label: 'Fenwick Tree (BIT)',
    sublabel: 'Binary Indexed Tree',
    category: 'ds',
    status: 'learning',
    masteryScore: 78,
    complexity: { time: 'O(log N)', space: 'O(N)' },
    description:
      'Cấu trúc cây nhị phân chỉ số cho phép tính tổng tiền tố và cập nhật phần tử với lượng mã nguồn cực kỳ ngắn gọn.',
    icon: 'bar_chart',
    relatedCount: 2,
    prerequisites: ['prefix-sum'],
    successors: ['rmq'],
  },
  {
    id: 'lca',
    label: 'Lowest Common Ancestor',
    sublabel: 'Tổ tiên chung gần nhất LCA',
    category: 'algo',
    status: 'learning',
    masteryScore: 60,
    complexity: { time: 'O(log N)', space: 'O(N log N)' },
    description:
      'Kỹ thuật nhảy nhị phân (Binary Lifting) trên cây để tìm tổ tiên chung gần nhất của hai nút trong thời gian logarit.',
    icon: 'account_tree',
    relatedCount: 2,
    prerequisites: ['dijkstra'],
    successors: ['hld'],
  },
  {
    id: 'bitmask',
    label: 'Bitmask DP',
    sublabel: 'Quy hoạch động Bit',
    category: 'algo',
    status: 'locked',
    masteryScore: 35,
    complexity: { time: 'O(2^N * N)', space: 'O(2^N)' },
    description:
      'Kỹ thuật quy hoạch động sử dụng các bit của một số nguyên để biểu diễn trạng thái của một tập hợp phần tử con.',
    icon: 'pin',
    relatedCount: 2,
    prerequisites: ['knapsack'],
    successors: [],
  },
  {
    id: 'sparse-table',
    label: 'Sparse Table RMQ',
    sublabel: 'Bảng thưa O(1)',
    category: 'ds',
    status: 'mastered',
    masteryScore: 82,
    complexity: { time: 'O(1) Query', space: 'O(N log N)' },
    description:
      'Cấu trúc bảng thưa tiền xử lý trong O(N log N) cho phép trả lời các truy vấn đoạn bất biến (như min, max, gcd) trong O(1).',
    icon: 'table_view',
    relatedCount: 2,
    prerequisites: ['rmq'],
    successors: [],
  },
  {
    id: 'red-black',
    label: 'Red-Black Tree',
    sublabel: 'Cây đỏ đen',
    category: 'ds',
    status: 'learning',
    masteryScore: 55,
    complexity: { time: 'O(log N)', space: 'O(N)' },
    description:
      'Cây nhị phân tìm kiếm tự cân bằng xấp xỉ sử dụng thuộc tính màu của nút, nền tảng của std::set và std::map trong C++ STL.',
    icon: 'circle',
    relatedCount: 1,
    prerequisites: ['avl'],
    successors: [],
  },
  {
    id: 'topo-sort',
    label: 'Topological Sort',
    sublabel: 'Sắp xếp tô-pô',
    category: 'algo',
    status: 'mastered',
    masteryScore: 90,
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    description:
      'Thứ tự tuyến tính của các đỉnh trong đồ thị có hướng không chu trình (DAG), phục vụ việc lập lịch phụ thuộc tác vụ.',
    icon: 'sort',
    relatedCount: 2,
    prerequisites: ['dsu'],
    successors: [],
  },
  {
    id: 'floyd',
    label: 'Floyd-Warshall',
    sublabel: 'Mọi cặp đỉnh O(V^3)',
    category: 'algo',
    status: 'mastered',
    masteryScore: 85,
    complexity: { time: 'O(V^3)', space: 'O(V^2)' },
    description:
      'Thuật toán quy hoạch động tìm đường đi ngắn nhất giữa tất cả các cặp đỉnh trên đồ thị có hướng có hoặc không có trọng số âm.',
    icon: 'hub',
    relatedCount: 1,
    prerequisites: ['dijkstra'],
    successors: [],
  },
  {
    id: 'convex-hull',
    label: 'Convex Hull',
    sublabel: 'Bao lồi hình học',
    category: 'math',
    status: 'learning',
    masteryScore: 50,
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    description:
      'Thuật toán Graham Scan và Monotone Chain tìm đa giác lồi nhỏ nhất chứa toàn bộ tập hợp điểm trong mặt phẳng 2D.',
    icon: 'polyline',
    relatedCount: 1,
    prerequisites: [],
    successors: [],
  },
  {
    id: 'kmp',
    label: 'KMP String Matching',
    sublabel: 'Khớp chuỗi Knuth-Morris-Pratt',
    category: 'algo',
    status: 'mastered',
    masteryScore: 78,
    complexity: { time: 'O(N + M)', space: 'O(M)' },
    description:
      'Thuật toán tìm kiếm xâu mẫu trong văn bản bằng hàm tiền tố π (prefix function) giúp bỏ qua các phép so sánh dư thừa.',
    icon: 'find_in_page',
    relatedCount: 1,
    prerequisites: ['trie'],
    successors: [],
  },
  {
    id: 'hld',
    label: 'Heavy-Light Decomposition',
    sublabel: 'Phân rã đường đi HLD',
    category: 'icpc',
    status: 'locked',
    masteryScore: 30,
    complexity: { time: 'O(log^2 N)', space: 'O(N)' },
    description:
      'Kỹ thuật phân rã cây thành các chuỗi nặng và nhẹ, kết hợp với Segment Tree để truy vấn đường đi trên cây.',
    icon: 'schema',
    relatedCount: 2,
    prerequisites: ['lca'],
    successors: [],
  },
  {
    id: 'max-flow',
    label: 'Ford-Fulkerson & Dinic',
    sublabel: 'Luồng cực đại',
    category: 'icpc',
    status: 'locked',
    masteryScore: 40,
    complexity: { time: 'O(V^2 E)', space: 'O(V + E)' },
    description:
      'Mô hình mạng luồng tìm luồng cực đại và lát cắt cực tiểu trên đồ thị có hướng dung lượng.',
    icon: 'water',
    relatedCount: 1,
    prerequisites: ['dsu'],
    successors: [],
  },
  {
    id: 'plo-01',
    label: 'PLO 01: Cấu trúc Dữ liệu Nâng cao',
    sublabel: 'Chuẩn đồ thị & phân rã',
    category: 'plo',
    status: 'mastered',
    masteryScore: 95,
    complexity: { time: 'Chuẩn Xuất sắc', space: 'Bậc 4' },
    description:
      'Kỹ năng thiết kế, triển khai và đánh giá hiệu năng các cấu trúc dữ liệu nâng cao đáp ứng tiêu chuẩn quốc tế ACM/IEEE.',
    icon: 'verified',
    relatedCount: 2,
    prerequisites: ['seg-tree'],
    successors: [],
  },
];

export const mockKnowledgeEdges: KnowledgeEdgeData[] = [
  // Cạnh trọng tâm kết nối trực tiếp với Segment Tree
  {
    id: 'e-bst-seg',
    source: 'bst',
    target: 'seg-tree',
    label: 'yêu cầu tiên quyết',
    relationshipType: 'requires',
    dashed: true,
    weight: 1.5,
  },
  {
    id: 'e-pref-seg',
    source: 'prefix-sum',
    target: 'seg-tree',
    label: 'tối ưu hóa O(logN)',
    relationshipType: 'optimizes',
    animated: true,
    weight: 2.0,
  },
  {
    id: 'e-seg-lazy',
    source: 'seg-tree',
    target: 'lazy-prop',
    label: 'mở rộng thuật toán',
    relationshipType: 'extends',
    animated: true,
    weight: 1.5,
  },
  {
    id: 'e-seg-rmq',
    source: 'seg-tree',
    target: 'rmq',
    label: 'giải quyết bài toán',
    relationshipType: 'solves',
    weight: 1.0,
  },
  {
    id: 'e-seg-plo04',
    source: 'seg-tree',
    target: 'plo-04',
    label: 'đánh giá chuẩn PLO',
    relationshipType: 'evaluates',
    dashed: true,
    weight: 1.0,
  },
  {
    id: 'e-seg-plo01',
    source: 'seg-tree',
    target: 'plo-01',
    label: 'chuẩn năng lực cấu trúc',
    relationshipType: 'evaluates',
    weight: 1.0,
  },

  // Cạnh bậc 2 và bậc 3 xung quanh
  {
    id: 'e-pref-fenwick',
    source: 'prefix-sum',
    target: 'fenwick',
    label: 'cải tiến mảng chỉ số',
    relationshipType: 'optimizes',
    weight: 1.0,
  },
  {
    id: 'e-fenwick-rmq',
    source: 'fenwick',
    target: 'rmq',
    label: 'truy vấn đoạn',
    relationshipType: 'solves',
    weight: 1.2,
  },
  {
    id: 'e-lazy-dijkstra',
    source: 'lazy-prop',
    target: 'dijkstra',
    label: 'tối ưu cấu trúc hàng đợi',
    relationshipType: 'extends',
    weight: 2.5,
  },
  {
    id: 'e-rmq-sparse',
    source: 'rmq',
    target: 'sparse-table',
    label: 'tối ưu O(1)',
    relationshipType: 'optimizes',
    weight: 1.0,
  },
  {
    id: 'e-rmq-knapsack',
    source: 'rmq',
    target: 'knapsack',
    label: 'kỹ thuật quy hoạch động',
    relationshipType: 'extends',
    weight: 2.0,
  },
  {
    id: 'e-knapsack-bitmask',
    source: 'knapsack',
    target: 'bitmask',
    label: 'trạng thái bit nâng cao',
    relationshipType: 'extends',
    weight: 3.0,
  },
  {
    id: 'e-bst-avl',
    source: 'bst',
    target: 'avl',
    label: 'cân bằng xoay cây',
    relationshipType: 'optimizes',
    weight: 1.5,
  },
  {
    id: 'e-avl-redblack',
    source: 'avl',
    target: 'red-black',
    label: 'tối ưu số lần xoay',
    relationshipType: 'extends',
    weight: 2.0,
  },
  {
    id: 'e-bst-trie',
    source: 'bst',
    target: 'trie',
    label: 'cấu trúc chuỗi ký tự',
    relationshipType: 'extends',
    weight: 1.5,
  },
  {
    id: 'e-trie-kmp',
    source: 'trie',
    target: 'kmp',
    label: 'so khớp mẫu chuỗi',
    relationshipType: 'solves',
    weight: 2.0,
  },
  {
    id: 'e-pref-dsu',
    source: 'prefix-sum',
    target: 'dsu',
    label: 'quản lý tập hợp',
    relationshipType: 'extends',
    weight: 1.0,
  },
  {
    id: 'e-dsu-topo',
    source: 'dsu',
    target: 'topo-sort',
    label: 'chu trình đồ thị',
    relationshipType: 'solves',
    weight: 1.5,
  },
  {
    id: 'e-dsu-maxflow',
    source: 'dsu',
    target: 'max-flow',
    label: 'mạng lát cắt',
    relationshipType: 'extends',
    weight: 3.5,
  },
  {
    id: 'e-dijkstra-floyd',
    source: 'dijkstra',
    target: 'floyd',
    label: 'mở rộng mọi cặp đỉnh',
    relationshipType: 'extends',
    weight: 2.0,
  },
  {
    id: 'e-dijkstra-lca',
    source: 'dijkstra',
    target: 'lca',
    label: 'nhảy nhị phân trên cây',
    relationshipType: 'extends',
    weight: 2.0,
  },
  {
    id: 'e-lca-hld',
    source: 'lca',
    target: 'hld',
    label: 'phân rã đường đi nặng nhẹ',
    relationshipType: 'extends',
    weight: 4.0,
  },
  {
    id: 'e-plo04-plo02',
    source: 'plo-04',
    target: 'plo-02',
    label: 'liên đới chuẩn năng lực',
    relationshipType: 'evaluates',
    dashed: true,
    weight: 0.5,
  },
];

/**
 * Thuật toán Dijkstra tìm lộ trình ngắn nhất giữa 2 nút trong đồ thị tri thức
 */
export function findDijkstraShortestPath(
  sourceId: string,
  targetId: string,
  nodes: KnowledgeNodeData[] = mockKnowledgeNodes,
  edges: KnowledgeEdgeData[] = mockKnowledgeEdges
): ShortestPathResult {
  const nodeMap = new Map<string, KnowledgeNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) {
    return {
      pathIds: [sourceId, targetId],
      nodeLabels: [
        nodeMap.get(sourceId)?.label || sourceId,
        nodeMap.get(targetId)?.label || targetId,
      ],
      totalTimeEstimate: '2.0 giờ',
      stepsCount: 1,
    };
  }

  // Xây dựng danh sách kề (adjacency list)
  const adj = new Map<string, Array<{ target: string; weight: number }>>();
  nodes.forEach((n) => adj.set(n.id, []));

  edges.forEach((e) => {
    const w = e.weight || 1.0;
    // Đồ thị định hướng hoặc hai chiều có trọng số
    adj.get(e.source)?.push({ target: e.target, weight: w });
    // Thêm liên kết ngược với trọng số phạt nhẹ để hỗ trợ tìm đường
    adj.get(e.target)?.push({ target: e.source, weight: w * 1.2 });
  });

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  nodes.forEach((n) => {
    dist.set(n.id, Infinity);
    prev.set(n.id, null);
  });

  dist.set(sourceId, 0);

  while (visited.size < nodes.length) {
    let u: string | null = null;
    let minDist = Infinity;

    for (const [nodeId, d] of dist.entries()) {
      if (!visited.has(nodeId) && d < minDist) {
        minDist = d;
        u = nodeId;
      }
    }

    if (!u || u === targetId || minDist === Infinity) break;
    visited.add(u);

    const neighbors = adj.get(u) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.target)) continue;
      const alt = dist.get(u)! + edge.weight;
      if (alt < dist.get(edge.target)!) {
        dist.set(edge.target, alt);
        prev.set(edge.target, u);
      }
    }
  }

  // Truy vết đường đi
  const path: string[] = [];
  let curr: string | null = targetId;

  while (curr !== null) {
    path.unshift(curr);
    curr = prev.get(curr) || null;
    if (curr === sourceId) {
      path.unshift(sourceId);
      break;
    }
  }

  // Fallback nếu không liên thông: trả về đường đi trực tiếp
  const finalPath = path.length > 0 && path[0] === sourceId ? path : [sourceId, targetId];

  const nodeLabels = finalPath.map((id) => nodeMap.get(id)?.label || id);
  const stepsCount = Math.max(1, finalPath.length - 1);
  const hours = (stepsCount * 1.75).toFixed(1);

  return {
    pathIds: finalPath,
    nodeLabels,
    totalTimeEstimate: `${hours} giờ`,
    stepsCount,
  };
}

export function getKnowledgeStats(nodes: KnowledgeNodeData[] = mockKnowledgeNodes): KnowledgeGraphStats {
  const masteredCount = nodes.filter((n) => n.status === 'mastered').length;
  const inProgressCount = nodes.filter((n) => n.status === 'learning').length;
  return {
    totalEntities: nodes.length,
    masteredCount,
    inProgressCount,
    relationshipsCount: mockKnowledgeEdges.length,
  };
}
