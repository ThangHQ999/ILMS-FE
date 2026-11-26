export type KnowledgeCategory = 'all' | 'ds' | 'algo' | 'icpc' | 'plo' | 'math';

export type KnowledgeStatus = 'mastered' | 'learning' | 'prerequisite' | 'locked';

export type KnowledgeRelationshipType =
  | 'requires'
  | 'optimizes'
  | 'extends'
  | 'solves'
  | 'evaluates';

export type RelationLabel =
  | 'IS_A'
  | 'HAS_CATEGORY'
  | 'HAS_SUBTYPE'
  | 'CLASSIFIED_INTO'
  | 'IS_VARIANT_OF'
  | 'PART_OF'
  | 'COMPOSED_OF'
  | 'CONTAINS'
  | 'REQUIRES'
  | 'DEPENDS_ON'
  | 'APPLIES_TO'
  | 'ASSOCIATED_WITH'
  | 'USES'
  | 'CONTRASTS_WITH'
  | 'IMPROVES_UPON'
  | 'CAUSES'
  | 'LEADS_TO'
  | 'SOLVES'
  | 'PRODUCES'
  | 'YIELDS'
  | 'CREATED_BY'
  | 'DISCOVERED_BY';

export type Neo4jRelationType = RelationLabel | 'PREREQUISITE' | 'RELATED_TO' | (string & {});

export interface RelationDefinition {
  value: RelationLabel;
  label: string;
  category: 'hierarchy' | 'composition' | 'dependency' | 'association' | 'causality' | 'origin';
  categoryLabel: string;
  description: string;
  icon: string;
}

export const STANDARD_RELATIONS: RelationDefinition[] = [
  // 1. Phân loại & Cấu trúc (Hierarchy & Subtypes)
  { value: 'IS_A', label: 'Là một (Is a)', category: 'hierarchy', categoryLabel: 'Phân loại & Thứ bậc', description: 'Source là một thể loại con của Target', icon: 'account_tree' },
  { value: 'HAS_CATEGORY', label: 'Có thể loại (Has category)', category: 'hierarchy', categoryLabel: 'Phân loại & Thứ bậc', description: 'Thuộc về danh mục phân loại', icon: 'category' },
  { value: 'HAS_SUBTYPE', label: 'Có kiểu con (Has subtype)', category: 'hierarchy', categoryLabel: 'Phân loại & Thứ bậc', description: 'Có chứa các dạng phụ / biến thể', icon: 'subdirectory_arrow_right' },
  { value: 'CLASSIFIED_INTO', label: 'Phân loại vào (Classified into)', category: 'hierarchy', categoryLabel: 'Phân loại & Thứ bậc', description: 'Được xếp vào nhóm cụ thể', icon: 'folder_special' },
  { value: 'IS_VARIANT_OF', label: 'Là biến thể của (Is variant of)', category: 'hierarchy', categoryLabel: 'Phân loại & Thứ bậc', description: 'Một biến thể đặc thù của khái niệm gốc', icon: 'tune' },

  // 2. Thành phần & Bao hàm (Composition & Containment)
  { value: 'PART_OF', label: 'Là thành phần của (Part of)', category: 'composition', categoryLabel: 'Thành phần & Bao hàm', description: 'Source là một bộ phận hợp thành Target', icon: 'pie_chart' },
  { value: 'COMPOSED_OF', label: 'Cấu thành từ (Composed of)', category: 'composition', categoryLabel: 'Thành phần & Bao hàm', description: 'Bao gồm các thành phần cấu tạo nên', icon: 'layers' },
  { value: 'CONTAINS', label: 'Bao hàm / Chứa (Contains)', category: 'composition', categoryLabel: 'Thành phần & Bao hàm', description: 'Chứa đựng khái niệm hoặc thực thể con', icon: 'check_box_outline_blank' },

  // 3. Tiên quyết & Phụ thuộc (Prerequisites & Dependency)
  { value: 'REQUIRES', label: 'Yêu cầu tiên quyết (Requires)', category: 'dependency', categoryLabel: 'Tiên quyết & Phụ thuộc', description: 'Cần học hoặc nắm vững trước', icon: 'priority_high' },
  { value: 'DEPENDS_ON', label: 'Phụ thuộc vào (Depends on)', category: 'dependency', categoryLabel: 'Tiên quyết & Phụ thuộc', description: 'Phụ thuộc mặt thuật toán hoặc cấu trúc logic', icon: 'link' },
  { value: 'APPLIES_TO', label: 'Áp dụng cho (Applies to)', category: 'dependency', categoryLabel: 'Tiên quyết & Phụ thuộc', description: 'Ứng dụng trong phạm vi hoặc bài toán cụ thể', icon: 'task_alt' },

  // 4. Liên kết & So sánh (Association & Comparison)
  { value: 'ASSOCIATED_WITH', label: 'Liên kết với (Associated with)', category: 'association', categoryLabel: 'Liên kết & Đối chiếu', description: 'Có mối liên hệ học thuật mật thiết', icon: 'hub' },
  { value: 'USES', label: 'Sử dụng / Vận dụng (Uses)', category: 'association', categoryLabel: 'Liên kết & Đối chiếu', description: 'Dùng như một công cụ hoặc cấu trúc dữ liệu', icon: 'handyman' },
  { value: 'CONTRASTS_WITH', label: 'Tương phản / So sánh (Contrasts with)', category: 'association', categoryLabel: 'Liên kết & Đối chiếu', description: 'So sánh khác biệt với khái niệm đối ứng', icon: 'compare' },
  { value: 'IMPROVES_UPON', label: 'Cải tiến từ (Improves upon)', category: 'association', categoryLabel: 'Liên kết & Đối chiếu', description: 'Tối ưu hóa hoặc nâng cấp từ phiên bản trước', icon: 'trending_up' },

  // 5. Nguyên nhân - Kết quả & Giải pháp (Causality & Solutions)
  { value: 'CAUSES', label: 'Gây ra (Causes)', category: 'causality', categoryLabel: 'Nguyên nhân & Hệ quả', description: 'Là nguyên nhân dẫn tới hiện tượng/trạng thái', icon: 'bolt' },
  { value: 'LEADS_TO', label: 'Dẫn tới (Leads to)', category: 'causality', categoryLabel: 'Nguyên nhân & Hệ quả', description: 'Dẫn đến kết quả hoặc bước tiếp theo', icon: 'arrow_forward' },
  { value: 'SOLVES', label: 'Giải quyết (Solves)', category: 'causality', categoryLabel: 'Nguyên nhân & Hệ quả', description: 'Giải quyết triệt để vấn đề hoặc bài toán', icon: 'lightbulb' },
  { value: 'PRODUCES', label: 'Tạo ra / Sinh ra (Produces)', category: 'causality', categoryLabel: 'Nguyên nhân & Hệ quả', description: 'Sinh ra sản phẩm, dữ liệu hoặc trạng thái mới', icon: 'auto_awesome' },
  { value: 'YIELDS', label: 'Mang lại / Đem lại (Yields)', category: 'causality', categoryLabel: 'Nguyên nhân & Hệ quả', description: 'Đem lại hiệu quả hoặc kết quả học tập', icon: 'verified' },

  // 6. Nguồn gốc & Tác giả (Origin & Authorship)
  { value: 'CREATED_BY', label: 'Được tạo bởi (Created by)', category: 'origin', categoryLabel: 'Nguồn gốc & Tác giả', description: 'Được xây dựng hoặc thiết kế bởi tác giả/nhóm', icon: 'person' },
  { value: 'DISCOVERED_BY', label: 'Khám phá bởi (Discovered by)', category: 'origin', categoryLabel: 'Nguồn gốc & Tác giả', description: 'Được phát minh hoặc tìm ra bởi nhà nghiên cứu', icon: 'explore' },
];

export function getRelationDisplayLabel(relationType: string): string {
  const normalized = relationType?.trim().toUpperCase();
  if (!normalized) return 'Liên kết';

  const match = STANDARD_RELATIONS.find((r) => r.value === normalized);
  if (match) return match.label.split(' (')[0]; // Nhãn ngắn gọn tiếng Việt

  if (normalized === 'PREREQUISITE') return 'Tiên quyết';
  if (normalized === 'RELATED_TO' || normalized === 'RELATES_TO') return 'Liên quan';
  if (normalized === 'INCLUDES') return 'Bao gồm';
  if (normalized === 'STEP') return 'Bước kế';
  if (normalized === 'DEFINES') return 'Định nghĩa';
  if (normalized === 'HAS_PROCESS') return 'Có quy trình';
  if (normalized === 'HAS_EXERCISE') return 'Có bài tập';
  if (normalized === 'HAS_EXAMPLE') return 'Có ví dụ';
  if (normalized === 'HAS_ARGUMENT') return 'Có luận cứ';

  // Nếu là quan hệ tùy biến của người dùng, trả về dạng dễ đọc
  return normalized.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export interface NodeComplexity {
  time: string;
  space: string;
}

export interface KnowledgeNodeData {
  [key: string]: unknown;
  id: string;
  label: string;
  sublabel?: string;
  canonicalCode?: string;
  topic?: string;
  kind?: string;
  isAuxiliary?: boolean;
  materialId?: string;
  materialTitle?: string;
  linkedLessonIds?: string[];
  category: Exclude<KnowledgeCategory, 'all'>;
  status: KnowledgeStatus;
  masteryScore: number;
  complexity: NodeComplexity;
  description: string;
  icon: string;
  isCenterpiece?: boolean;
  relatedCount?: number;
  prerequisites?: string[];
  successors?: string[];
  definitionText?: string;
  exceptions?: string[];
  conditions?: string[];
  parentEntityId?: string;
  parentEntityLabel?: string;
  auxiliaryActionText?: string;
  auxiliaryContentText?: string;
  stepNumber?: number;
  processes?: Array<{
    id?: string;
    name: string;
    description?: string;
    steps: Array<{ stepNumber: number; action: string }>;
  }>;
  exercises?: Array<{
    id?: string;
    title: string;
    content: string;
    steps?: Array<{ stepNumber: number; action: string }>;
  }>;
  examples?: Array<{
    id?: string;
    title: string;
    explanation?: string;
    codeSnippet?: string;
  }>;
  arguments?: Array<{
    id?: string;
    hypothesis: string;
    evidence: string;
    conclusion?: string;
  }>;
  chunks?: Array<{
    id?: string;
    locator?: string;
    text?: string;
  }>;
}

export interface KnowledgeEdgeData {
  [key: string]: unknown;
  id: string;
  source: string;
  target: string;
  label?: string;
  rawRelation?: string;
  relationshipType: KnowledgeRelationshipType;
  animated?: boolean;
  dashed?: boolean;
  weight?: number;
  isAuxiliary?: boolean;
}

export type EditTool = 'select' | 'add-node' | 'connect' | 'delete';

export type LayoutMode = 'force' | 'hierarchical' | 'circular';

export interface ShortestPathResult {
  pathIds: string[];
  nodeLabels: string[];
  totalTimeEstimate: string;
  stepsCount: number;
}

export interface GraphFilterState {
  searchQuery: string;
  selectedCategory: KnowledgeCategory;
  depth: number; // 1 - 4
  isSmartDimActive: boolean;
}

export interface KnowledgeGraphStats {
  totalEntities: number;
  masteredCount: number;
  inProgressCount: number;
  relationshipsCount: number;
}
