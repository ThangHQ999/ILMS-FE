export type LandingRolePerspective = 'student' | 'teacher';

export type MascotPoseVariant = 'hero' | 'socratic' | 'graph' | 'mastery';

export interface LandingSceneMeta {
  id: string;
  index: number;
  labelKey: string;
  pose: MascotPoseVariant;
}

export interface HeroPromptSample {
  id: string;
  subjectKey: string;
  questionKey: string;
  socraticHintKey: string;
  formula: string;
  followUpKey: string;
}

export interface SocraticStepItem {
  stepNumber: number;
  titleKey: string;
  studentThoughtKey: string;
  owlQuestionKey: string;
  formula: string;
  insightBadgeKey: string;
}

export type GraphNodeStatus = 'mastered' | 'inProgress' | 'gap';

export interface InteractiveGraphNode {
  id: string;
  titleKey: string;
  categoryKey: string;
  status: GraphNodeStatus;
  masteryPercent: number;
  x: number;
  y: number;
  connections: string[];
  diagnosticKey: string;
  recommendedActionKey: string;
  formulaHint: string;
}

export interface BloomLevelItem {
  level: number;
  code: string;
  nameKey: string;
  badgeKey: string;
  descKey: string;
  sampleQuestionKey: string;
  colorClass: string;
  glowColor: string;
  radarScores: [number, number, number, number, number, number];
}

export interface LandingFaqItem {
  id: string;
  questionKey: string;
  answerKey: string;
  categoryKey: string;
}
