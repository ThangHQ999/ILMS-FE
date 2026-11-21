import {
  listIngestionJobs,
  retryIngestionJob,
  uploadMaterialToIngestion,
} from './ingestion.service';
import type { IngestionJobSummary } from '../schemas/ingestion.schema';
import type {
  MaterialBackgroundTask,
  PipelineSettings,
  ClusterMetrics,
  TaskFileType,
  TaskStatus,
} from '../schemas/materials-tasks.schema';

const STORAGE_KEY_SETTINGS = 'ilms_material_pipeline_settings';

export const DEFAULT_PIPELINE_SETTINGS: PipelineSettings = {
  knowledgeGraphExtraction: true,
  bloomAutoQuiz: true,
  socraticVectorEmbedding: true,
  gpuMode: 'speed',
};

export const DEFAULT_CLUSTER_METRICS: ClusterMetrics = {
  gpuLoadPercent: 0,
  activeWorkers: 0,
  memoryUsedGb: 0,
  memoryTotalGb: 0,
  latencyMs: 0,
  nodeId: 'ilms-ingestion-worker',
};

function inferFileType(name?: string | null, fileType?: string | null): TaskFileType {
  const source = `${fileType ?? ''} ${name ?? ''}`.toLowerCase();
  if (source.includes('pptx') || source.includes('ppt')) return 'pptx';
  if (source.includes('docx') || source.includes('doc')) return 'docx';
  if (source.includes('mp4') || source.includes('mkv') || source.includes('webm')) return 'mp4';
  if (source.includes('pdf')) return 'pdf';
  return 'other';
}

function mapJobStatusToTaskStatus(status: IngestionJobSummary['status']): TaskStatus {
  if (status === 'COMPLETED' || status === 'SUCCESS') return 'SUCCESS';
  if (status === 'AWAITING_REVIEW') return 'AWAITING_REVIEW';
  if (status === 'PUBLISHING') return 'PUBLISHING';
  if (status === 'PROCESSING') return 'PROCESSING';
  if (status === 'FAILED') return 'FAILED';
  return 'QUEUED';
}

function mapProgressByStatus(status: IngestionJobSummary['status']): number {
  switch (status) {
    case 'QUEUED':
      return 10;
    case 'PROCESSING':
      return 50;
    case 'AWAITING_REVIEW':
      return 75;
    case 'PUBLISHING':
      return 90;
    case 'COMPLETED':
    case 'SUCCESS':
      return 100;
    case 'FAILED':
      return 0;
  }
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function mapIngestionJobToTask(job: IngestionJobSummary): MaterialBackgroundTask {
  const status = mapJobStatusToTaskStatus(job.status);
  return {
    id: job.jobId,
    jobId: job.jobId,
    filename: job.title || job.fileName || `Tai_lieu_${job.jobId.slice(0, 8)}`,
    size: formatFileSize(job.fileSizeBytes),
    fileType: inferFileType(job.fileName ?? job.title, job.fileType),
    status,
    courseName: job.courseTitle ?? job.subject ?? undefined,
    uploadedAt: job.createdAt ?? undefined,
    currentStep: job.stage ?? undefined,
    progressPercent: mapProgressByStatus(job.status),
    conceptsFound: job.conceptsCount ?? undefined,
    errorMessage: job.errorMessage ?? job.errorCode ?? undefined,
    tags: [job.stage || job.status],
  };
}

export function getStoredSettings(): PipelineSettings {
  if (typeof window === 'undefined') return DEFAULT_PIPELINE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_PIPELINE_SETTINGS;
    return { ...DEFAULT_PIPELINE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PIPELINE_SETTINGS;
  }
}

export function saveStoredSettings(settings: PipelineSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore storage quota errors
  }
}

export function saveStoredTasks(_tasks: MaterialBackgroundTask[]): void {
  // No-op: server ingestion_jobs is now the single source of truth.
}

/**
 * Fetch real ingestion jobs from Spring Boot GET /api/v1/materials/ingestion.
 * Zero mock data and zero localStorage merging.
 */
export async function fetchBackgroundTasks(): Promise<MaterialBackgroundTask[]> {
  const backendJobs = await listIngestionJobs();
  return backendJobs.map(mapIngestionJobToTask);
}

/**
 * Retry a failed task via POST /api/v1/materials/ingestion/{jobId}/retry.
 */
export async function retryTask(taskId: string): Promise<void> {
  await retryIngestionJob(taskId);
}

/**
 * Upload a new file into Flow B ingestion pipeline via POST /api/v1/materials.
 */
export async function uploadTaskFile(form: FormData): Promise<MaterialBackgroundTask> {
  const created = await uploadMaterialToIngestion(form);
  return mapIngestionJobToTask({
    jobId: created.jobId,
    materialId: created.materialId,
    title:
      created.title ||
      (typeof form.get('title') === 'string' ? (form.get('title') as string) : 'Untitled material'),
    subject:
      created.subject ||
      (typeof form.get('subject') === 'string' ? (form.get('subject') as string) : undefined),
    courseId: created.courseId,
    courseTitle: created.courseTitle,
    status: created.status,
    stage: created.stage,
    errorCode: created.errorCode,
    errorMessage: created.errorMessage,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  });
}

export function togglePauseTask(_taskId: string): MaterialBackgroundTask[] {
  return [];
}

export function boostTaskPriority(_taskId: string): MaterialBackgroundTask[] {
  return [];
}

export function removeTask(_taskId: string): MaterialBackgroundTask[] {
  return [];
}
