import { z } from 'zod';

export const statOverviewSchema = z.object({
  streakDays: z.number(),
  streakChangeText: z.string(),
  streakRecordDays: z.number(),
  studyHoursThisWeek: z.number(),
  studyHoursGoal: z.number(),
  studyHoursGoalPercent: z.number(),
  knowledgeNodesUnlocked: z.number(),
  knowledgeNodesTotal: z.number(),
  knowledgeGraphPercent: z.number(),
  knowledgeGraphTopic: z.string(),
  approachingDeadlinesCount: z.number(),
  nearestDeadlineDescription: z.string(),
});

export const heatmapCellSchema = z.object({
  week: z.number(),
  day: z.number(), // 0 = Mon, 6 = Sun
  level: z.enum(['empty', 'weak', 'medium', 'good', 'master']),
  date: z.string().optional(),
});

export const competencyPillarSchema = z.object({
  id: z.string(),
  title: z.string(),
  percentage: z.number(),
  statusText: z.string(),
  level: z.enum(['weak', 'medium', 'good', 'master']),
});

export const aiInsightSchema = z.object({
  accuracyPercent: z.number(),
  gapDetectedTitle: z.string(),
  warningNarrative: z.string(),
  subNarrative: z.string(),
  durationMinutes: z.number(),
  questionCount: z.number(),
  difficultyText: z.string(),
  xpReward: z.number(),
  ploRecoveryPercent: z.number(),
});

export const courseProgressSchema = z.object({
  id: z.string(),
  title: z.string(),
  codeOrClass: z.string(),
  instructor: z.string(),
  icon: z.string(),
  colorType: z.enum(['secondary', 'tertiary', 'emerald']),
  nodesCompleted: z.number(),
  nodesTotal: z.number(),
  progressPercent: z.number(),
  avgScore: z.number(),
  maxScore: z.number().default(10),
  status: z.enum(['in_progress', 'approaching_exam', 'completed']),
  statusBadgeText: z.string(),
  actionText: z.string(),
  actionIcon: z.string(),
});

export const notificationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timeAgo: z.string(),
  isRead: z.boolean(),
  category: z.enum(['all', 'ai', 'quiz', 'plo', 'announcement', 'system']),
  icon: z.string(),
  colorType: z.enum(['secondary', 'amber', 'emerald', 'neutral']),
  actionText: z.string().optional(),
  actionUrl: z.string().optional(),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'ai']),
  senderName: z.string(),
  content: z.string(),
  timestamp: z.string(),
  attachment: z
    .object({
      title: z.string(),
      subtitle: z.string(),
      icon: z.string(),
      actionText: z.string(),
    })
    .optional(),
});

export const aiTaskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtext: z.string(),
  isDone: z.boolean(),
  doneAt: z.string().optional(),
  type: z.enum(['review', 'quiz', 'codelab']),
  badgeText: z.string().optional(),
  badgeUrl: z.string().optional(),
  icon: z.string(),
});
