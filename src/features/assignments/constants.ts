export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (classId: string, filters: Record<string, unknown>) =>
    [...assignmentKeys.lists(), classId, filters] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  gradeProgress: (classId: string) => [...assignmentKeys.all, 'grade-progress', classId] as const,
  aiRecommendation: (classId: string) => [...assignmentKeys.all, 'ai-recommendation', classId] as const,
  studentPerformance: (classId: string) => [...assignmentKeys.all, 'student-performance', classId] as const,
  classHubInfo: (classId: string) => [...assignmentKeys.all, 'class-hub-info', classId] as const,
};

export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (classId?: string, params?: Record<string, unknown>) =>
    [...quizKeys.lists(), classId, params] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  play: (id: string) => [...quizKeys.all, 'play', id] as const,
  stats: (classId?: string) => [...quizKeys.all, 'stats', classId] as const,
  questionBank: (params?: Record<string, unknown>) =>
    [...quizKeys.all, 'question-bank', params] as const,
  proctor: (quizId: string) => [...quizKeys.all, 'proctor', quizId] as const,
  complaints: (quizId: string) => [...quizKeys.all, 'complaints', quizId] as const,
  analytics: (quizId: string) => [...quizKeys.all, 'analytics', quizId] as const,
};

export const CHAPTER_OPTIONS = [
  { value: 'ALL', labelKey: 'assignments.filters.allChapters' },
  { value: 'CH1', labelKey: 'assignments.filters.ch1' },
  { value: 'CH2', labelKey: 'assignments.filters.ch2' },
  { value: 'CH3', labelKey: 'assignments.filters.ch3' },
  { value: 'CH4', labelKey: 'assignments.filters.ch4' },
];

export const TOPIC_OPTIONS = [
  { value: 'ALL', labelKey: 'assignments.filters.allTopics' },
  { value: 'TRANSPORT', labelKey: 'assignments.filters.topicTransport' },
  { value: 'NETWORK', labelKey: 'assignments.filters.topicNetwork' },
  { value: 'APPLICATION', labelKey: 'assignments.filters.topicApp' },
  { value: 'WIRESHARK', labelKey: 'assignments.filters.topicWireshark' },
];

export const DIFFICULTY_OPTIONS = [
  { value: 'ALL', labelKey: 'assignments.filters.allDifficulties' },
  { value: 'BLOOM1', labelKey: 'assignments.filters.bloom1' },
  { value: 'BLOOM2', labelKey: 'assignments.filters.bloom2' },
  { value: 'BLOOM3', labelKey: 'assignments.filters.bloom3' },
  { value: 'BLOOM4', labelKey: 'assignments.filters.bloom4' },
];

