import { z } from 'zod';

export const radarDimensionSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  userScore: z.number().min(0).max(100),
  classAvg: z.number().min(0).max(100),
  ploTarget: z.number().min(0).max(100),
  personalTarget: z.number().min(0).max(100),
  isWarning: z.boolean().optional(),
});

export const competencyRadarSchema = z.object({
  courseId: z.string(),
  courseName: z.string(),
  dimensions: z.array(radarDimensionSchema),
  overallUserScore: z.number(),
  overallClassAvg: z.number(),
  overallPloTarget: z.number(),
});

export const masteryTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.enum(['excellent', 'master', 'progressing', 'needs_reinforcement']),
  tierLabel: z.string(),
  progress: z.number(),
  subtitle: z.string().optional(),
  statusBadgeColor: z.string().optional(),
  isBottleneck: z.boolean().optional(),
});

export const skillNodeSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  name: z.string(),
  stage: z.number(),
  stageLabel: z.string(),
  status: z.enum(['mastered', 'learning', 'locked']),
  masteryPercentage: z.number(),
  scoreRatio: z.string(),
  complexityOrMetric: z.string(),
  desc: z.string(),
  labsRatio: z.string(),
  prerequisites: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      isMet: z.boolean(),
    })
  ),
  nextUnlocks: z.array(
    z.object({
      name: z.string(),
      statusLabel: z.string(),
      isLocked: z.boolean(),
    })
  ),
});

export const focusGoalSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  category: z.string(),
  ploCode: z.string(),
  subtag: z.string(),
  currentScore: z.number(),
  targetScore: z.number(),
  scoreGap: z.number(),
  statusText: z.string(),
  urgency: z.enum(['urgent', 'medium', 'reviewed']),
  bottleneckReason: z.string(),
  actionNotice: z.string(),
  milestoneUnlock: z.string(),
});
