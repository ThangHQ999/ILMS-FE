import { z } from 'zod';
import {
  statOverviewSchema,
  heatmapCellSchema,
  competencyPillarSchema,
  aiInsightSchema,
  courseProgressSchema,
  notificationItemSchema,
  chatMessageSchema,
  aiTaskItemSchema,
} from './schemas/dashboard.schema';

export type StatOverview = z.infer<typeof statOverviewSchema>;
export type HeatmapCell = z.infer<typeof heatmapCellSchema>;
export type CompetencyPillar = z.infer<typeof competencyPillarSchema>;
export type AIInsight = z.infer<typeof aiInsightSchema>;
export type CourseProgress = z.infer<typeof courseProgressSchema>;
export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type AITaskItem = z.infer<typeof aiTaskItemSchema>;

export type DashboardMode = 'analytics' | 'focus';
export type NotificationTab = 'all' | 'unread' | 'courses' | 'ai';
export type CourseFilterTab = 'all' | 'in_progress' | 'completed';

export interface SubAccountItem {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  avatarGradient?: string;
  status: 'active' | 'expired';
}
