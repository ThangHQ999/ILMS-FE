export type KnowledgeCategory = 'all' | 'ds' | 'algo' | 'icpc' | 'plo' | 'math';

export type KnowledgeStatus = 'mastered' | 'learning' | 'prerequisite' | 'locked';

export type KnowledgeRelationshipType =
  | 'requires'
  | 'optimizes'
  | 'extends'
  | 'solves'
  | 'evaluates';

export interface NodeComplexity {
  time: string;
  space: string;
}

export interface KnowledgeNodeData {
  [key: string]: unknown;
  id: string;
  label: string;
  sublabel?: string;
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
}

export interface KnowledgeEdgeData {
  [key: string]: unknown;
  id: string;
  source: string;
  target: string;
  label?: string;
  relationshipType: KnowledgeRelationshipType;
  animated?: boolean;
  dashed?: boolean;
  weight?: number;
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
