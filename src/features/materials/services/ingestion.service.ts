import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import {
  draftGraphSnapshotSchema,
  ingestionDraftSchema,
  ingestionJobDetailSchema,
  ingestionJobSummarySchema,
  type DraftGraphSnapshot,
  type IngestionDraft,
  type IngestionJobDetail,
  type IngestionJobSummary,
  type ReviewDecision,
  graphValidationResponseSchema,
  graphAiRepairResponseSchema,
  type GraphValidationResponseDTO,
  type GraphAiRepairResponseDTO,
} from '../schemas/ingestion.schema';

const INGESTION_ROOT = '/materials/ingestion';

function extractArrayPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.jobs)) return obj.jobs;
  }
  return [];
}

/**
 * Flow B: Upload a material directly into the Spring Boot -> FastAPI ingestion pipeline.
 * POST /api/v1/materials (multipart/form-data: file, title, subject, courseId?)
 */
export async function uploadMaterialToIngestion(
  form: FormData
): Promise<IngestionJobDetail> {
  const { data: res } = await api.post<ApiResponse<unknown>>('/materials', form, {
    headers: { 'Content-Type': undefined },
    timeout: 60_000,
  });
  return ingestionJobDetailSchema.parse(res.data);
}

/**
 * List all ingestion jobs visible to the authenticated user.
 * GET /api/v1/materials/ingestion
 */
export async function listIngestionJobs(): Promise<IngestionJobSummary[]> {
  const { data: res } = await api.get<ApiResponse<unknown>>(INGESTION_ROOT);
  const rawList = extractArrayPayload(res.data);
  return rawList.map((item) => ingestionJobSummarySchema.parse(item));
}

/**
 * Get full status, stage, errorCode, and latest draft payload of a specific ingestion job.
 * GET /api/v1/materials/ingestion/{jobId}
 */
export async function getIngestionJob(jobId: string): Promise<IngestionJobDetail> {
  const { data: res } = await api.get<ApiResponse<unknown>>(`${INGESTION_ROOT}/${jobId}`);
  return ingestionJobDetailSchema.parse(res.data);
}

/**
 * Fetch the Neo4j-synced draft graph projection for a specific revision.
 * GET /api/v1/materials/ingestion/{jobId}/drafts/{revisionId}/graph
 */
export async function getDraftRevisionGraph(
  jobId: string,
  revisionId: string
): Promise<DraftGraphSnapshot> {
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `${INGESTION_ROOT}/${jobId}/drafts/${revisionId}/graph`
  );
  return draftGraphSnapshotSchema.parse(res.data);
}

/**
 * Persist an edited draft graph revision using optimistic concurrency (baseRevisionId + baseHash).
 * POST /api/v1/materials/ingestion/{jobId}/drafts
 */
export async function saveDraftRevision(
  jobId: string,
  params: {
    baseRevisionId: string;
    baseHash: string;
    graph: Record<string, unknown>;
  }
): Promise<IngestionDraft> {
  const { data: res } = await api.post<ApiResponse<unknown>>(
    `${INGESTION_ROOT}/${jobId}/drafts`,
    {
      baseRevisionId: params.baseRevisionId,
      baseHash: params.baseHash,
      graph: params.graph,
    }
  );
  return ingestionDraftSchema.parse(res.data);
}

/**
 * Submit a teacher review decision (APPROVED | CHANGES_REQUESTED | REJECTED).
 * POST /api/v1/materials/ingestion/{jobId}/review
 */
export async function reviewIngestionDraft(
  jobId: string,
  params: {
    baseRevisionId: string;
    baseHash: string;
    decision: ReviewDecision;
    comment?: string;
  }
): Promise<void> {
  await api.post(`${INGESTION_ROOT}/${jobId}/review`, {
    baseRevisionId: params.baseRevisionId,
    baseHash: params.baseHash,
    decision: params.decision,
    ...(params.comment?.trim() ? { comment: params.comment.trim() } : {}),
  });
}

/**
 * Retry a FAILED ingestion job.
 * POST /api/v1/materials/ingestion/{jobId}/retry
 */
export async function retryIngestionJob(jobId: string): Promise<void> {
  await api.post(`${INGESTION_ROOT}/${jobId}/retry`);
}

/**
 * Download the original uploaded document associated with an ingestion job.
 * GET /api/v1/materials/{materialId}/ingestion/{jobId}/file
 */
export async function downloadIngestionSourceFile(
  materialId: string,
  jobId: string,
  filename?: string
): Promise<void> {
  const response = await api.get(`/materials/${materialId}/ingestion/${jobId}/file`, {
    responseType: 'blob',
  });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename || `material-${jobId}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export interface IngestionCourseOption {
  courseId: string;
  name: string;
  className?: string;
}

/**
 * Fetch the authenticated user's courses to populate the Course selector in Flow B upload.
 * GET /api/v1/courses/users/{userId}
 */
export async function fetchUserCourseOptions(
  userId: string
): Promise<IngestionCourseOption[]> {
  if (!userId) return [];
  const { data: res } = await api.get<ApiResponse<unknown>>(`/courses/users/${userId}`);
  const rawList = extractArrayPayload(res.data);
  const seen = new Set<string>();
  const options: IngestionCourseOption[] = [];

  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const courseId =
      (typeof obj.courseId === 'string' && obj.courseId) ||
      (typeof obj.id === 'string' && obj.id) ||
      '';
    const name =
      (typeof obj.name === 'string' && obj.name) ||
      (typeof obj.courseTitle === 'string' && obj.courseTitle) ||
      '';
    if (!courseId || !name || seen.has(courseId)) continue;
    seen.add(courseId);
    options.push({
      courseId,
      name,
      className: typeof obj.className === 'string' ? obj.className : undefined,
    });
  }

  return options;
}

/**
 * Validate draft knowledge graph structure (DFS cycles, orphan nodes, missing descriptions).
 * POST /api/v1/knowledge-graphs/courses/{courseId}/validate
 */
export async function validateDraftKnowledgeGraph(
  courseId: string,
  snapshot: { nodes: unknown[]; edges: unknown[] }
): Promise<GraphValidationResponseDTO> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/validate`,
    snapshot
  );
  return graphValidationResponseSchema.parse(data.data);
}

/**
 * AI auto-repair for draft knowledge graph.
 * POST /api/v1/knowledge-graphs/courses/{courseId}/ai-repair
 */
export async function aiRepairDraftKnowledgeGraph(
  courseId: string,
  payload: { nodes: unknown[]; edges: unknown[]; instruction?: string }
): Promise<GraphAiRepairResponseDTO> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/ai-repair`,
    payload
  );
  return graphAiRepairResponseSchema.parse(data.data);
}

/**
 * Apply AI repaired knowledge graph to backend.
 * POST /api/v1/knowledge-graphs/courses/{courseId}/apply-ai-repair
 */
export async function applyAiRepairDraftKnowledgeGraph(
  courseId: string,
  payload: { repairSummary?: string; repairedNodes: unknown[]; repairedEdges: unknown[] }
): Promise<unknown> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/apply-ai-repair`,
    payload
  );
  return data.data;
}

