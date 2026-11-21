export type KnowledgeCategory = 'all' | 'ds' | 'algo' | 'icpc' | 'plo' | 'math';

export type KnowledgeStatus = 'mastered' | 'learning' | 'prerequisite' | 'locked';

export type KnowledgeRelationshipType =
  | 'requires'
  | 'optimizes'
  | 'extends'
  | 'solves'
  | 'evaluates';

export type Neo4jRelationType =
  | 'REQUIRES'
  | 'DEPENDS_ON'
  | 'IS_A'
  | 'PART_OF'
  | 'CONTRASTS_WITH'
  | 'USES'
  | 'APPLIES_TO'
  | 'PREREQUISITE'
  | 'RELATED_TO';

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
