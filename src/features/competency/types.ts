export interface RadarDimension {
  id: string;
  name: string;
  shortName: string;
  userScore: number;
  classAvg: number;
  ploTarget: number;
  personalTarget: number;
  isWarning?: boolean;
}

export interface CompetencyRadarData {
  courseId: string;
  courseName: string;
  dimensions: RadarDimension[];
  overallUserScore: number;
  overallClassAvg: number;
  overallPloTarget: number;
}

export interface MasteryTopic {
  id: string;
  name: string;
  tier: 'excellent' | 'master' | 'progressing' | 'needs_reinforcement';
  tierLabel: string;
  progress: number;
  subtitle?: string;
  statusBadgeColor?: string;
  isBottleneck?: boolean;
}

export interface MasteryTrendPoint {
  week: string;
  score: number;
  label: string;
}

export interface SocraticTask {
  id: string;
  title: string;
  duration: string;
  type: 'quiz' | 'video' | 'chat';
  description: string;
  actionText: string;
  actionUrl?: string;
}

export interface SocraticRecommendation {
  topicTitle: string;
  subtitle: string;
  explanation: string;
  estimatedDays: number;
  expectedBoost: number;
  tasks: SocraticTask[];
}

export interface QuickMetric {
  id: string;
  value: string;
  label: string;
  icon: string;
  colorClass: string;
  badge?: string;
}

export interface SkillNode {
  id: string;
  key: string;
  title: string;
  name: string;
  stage: number;
  stageLabel: string;
  status: 'mastered' | 'learning' | 'locked';
  masteryPercentage: number;
  scoreRatio: string;
  complexityOrMetric: string;
  desc: string;
  labsRatio: string;
  prerequisites: {
    name: string;
    score: number;
    isMet: boolean;
  }[];
  nextUnlocks: {
    name: string;
    statusLabel: string;
    isLocked: boolean;
  }[];
}

export interface SkillTreeStage {
  stageNumber: number;
  stageCode: string;
  title: string;
  isFocused?: boolean;
  nodes: SkillNode[];
}

export interface ClassHeatmapStudent {
  id: string;
  studentCode: string;
  name: string;
  avatarText: string;
  isCurrentUser: boolean;
  scores: {
    algo: number;
    segTree: number;
    fenwick: number;
    dijkstra: number;
    dpBitmask: number;
    advGraph: number;
  };
  overallPlo: number;
}

export interface ClassHeatmapData {
  classCode: string;
  totalStudents: number;
  students: ClassHeatmapStudent[];
  classAverages: {
    algo: number;
    segTree: number;
    fenwick: number;
    dijkstra: number;
    dpBitmask: number;
    advGraph: number;
    overallPlo: number;
  };
}

export interface FocusGoal {
  id: string;
  index: number;
  title: string;
  category: string;
  ploCode: string;
  subtag: string;
  currentScore: number;
  targetScore: number;
  scoreGap: number;
  statusText: string;
  urgency: 'urgent' | 'medium' | 'reviewed';
  bottleneckReason: string;
  actionNotice: string;
  milestoneUnlock: string;
}

export interface TheoryCardData {
  title: string;
  subTitle: string;
  stateDefinition: {
    term: string;
    desc: string;
  };
  recurrenceFormula: {
    code: string;
    explanationPoints: string[];
  };
}

export interface QuizOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface DiagnosticQuizData {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  title: string;
  questionText: string;
  options: QuizOption[];
  correctExplanation: string;
  wrongExplanation: string;
  socraticHint: string;
}
