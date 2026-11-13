import { z } from 'zod';

export const taskStatusSchema = z.enum([
  'PROCESSING',
  'QUEUED',
  'SUCCESS',
  'FAILED',
  'PAUSED',
]);

export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskFileTypeSchema = z.enum(['pdf', 'pptx', 'docx', 'mp4', 'other']);
export type TaskFileType = z.infer<typeof taskFileTypeSchema>;

export const taskLogEntrySchema = z.object({
  timestamp: z.string(),
  level: z.enum(['info', 'warn', 'error', 'success']),
  text: z.string(),
});
export type TaskLogEntry = z.infer<typeof taskLogEntrySchema>;

export const materialBackgroundTaskSchema = z.object({
  id: z.string(),
  jobId: z.string().optional(),
  filename: z.string(),
  size: z.string(),
  fileType: taskFileTypeSchema,
  status: taskStatusSchema,
  courseCode: z.string().optional(),
  courseName: z.string().optional(),
  uploadedBy: z.string().optional(),
  uploadedAt: z.string().optional(),
  currentStep: z.string().optional(),
  stepNumber: z.number().optional(),
  totalSteps: z.number().optional(),
  progressPercent: z.number().min(0).max(100),
  conceptsFound: z.number().optional(),
  conceptsSample: z.string().optional(),
  quizQuestionsGenerated: z.number().optional(),
  quizQuestionsTotal: z.number().optional(),
  tokensProcessed: z.number().optional(),
  tokensTotal: z.number().optional(),
  validationText: z.string().optional(),
  etaSeconds: z.number().optional(),
  queuePosition: z.number().optional(),
  queueCondition: z.string().optional(),
  queueEtaText: z.string().optional(),
  completedAt: z.string().optional(),
  completedSummary: z.string().optional(),
  errorMessage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  logs: z.array(taskLogEntrySchema).optional(),
});

export type MaterialBackgroundTask = z.infer<typeof materialBackgroundTaskSchema>;

export const pipelineSettingsSchema = z.object({
  knowledgeGraphExtraction: z.boolean(),
  bloomAutoQuiz: z.boolean(),
  socraticVectorEmbedding: z.boolean(),
  gpuMode: z.enum(['speed', 'eco']),
});

export type PipelineSettings = z.infer<typeof pipelineSettingsSchema>;

export const clusterMetricsSchema = z.object({
  gpuLoadPercent: z.number(),
  activeWorkers: z.number(),
  memoryUsedGb: z.number(),
  memoryTotalGb: z.number(),
  latencyMs: z.number(),
  nodeId: z.string(),
});

export type ClusterMetrics = z.infer<typeof clusterMetricsSchema>;
