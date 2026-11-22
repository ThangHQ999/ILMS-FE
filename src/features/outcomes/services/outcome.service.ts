import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  ploSchema,
  ploDetailSchema,
  paginatedPloSchema,
  type Plo,
  type PloDetail,
  type CreatePloInput,
  type UpdatePloInput,
} from '../schemas/plo.schema';
import {
  cloSchema,
  cloDetailSchema,
  cloPloMatrixSchema,
  type Clo,
  type CloDetail,
  type CreateCloInput,
  type UpdateCloInput,
  type CloPloMatrix,
  type UpdateCloPloMatrixInput,
  type CloConcept,
  type UpdateCloConceptsInput,
} from '../schemas/clo.schema';
import {
  courseKnowledgeHeatmapSchema,
  classKnowledgeHeatmapSchema,
  classKnowledgeGapsSchema,
  type CourseKnowledgeHeatmap,
  type ClassKnowledgeHeatmap,
  type ClassKnowledgeGaps,
} from '../schemas/knowledge-heatmap.schema';
import {
  classOutcomeAttainmentSchema,
  studentOutcomeAttainmentSchema,
  type ClassOutcomeAttainment,
  type StudentOutcomeAttainment,
} from '../schemas/outcome-attainment.schema';

// Helper to unpack ApiResponse<T> or raw T
function unwrap<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
}

// =========================================================================
// 1. PLO Endpoints (/api/v1/plos)
// =========================================================================

export async function getPlos(params?: {
  search?: string;
  page?: number;
  size?: number;
}): Promise<{ items: Plo[]; total: number; page: number; size: number }> {
  const { data } = await api.get<ApiResponse<unknown>>('/plos', {
    params: {
      search: params?.search || undefined,
      page: params?.page ?? 0,
      size: params?.size ?? 50,
    },
  });
  const raw = unwrap(data);

  // Parse as paginated response or direct array
  const pageResult = paginatedPloSchema.safeParse(raw);
  if (pageResult.success) {
    return {
      items: pageResult.data.content,
      total: pageResult.data.totalElements,
      page: pageResult.data.pageNumber,
      size: pageResult.data.pageSize,
    };
  }

  if (Array.isArray(raw)) {
    const items = raw.map((item) => ploSchema.parse(item));
    return {
      items,
      total: items.length,
      page: 0,
      size: items.length,
    };
  }

  return { items: [], total: 0, page: 0, size: 20 };
}

export async function getPloById(ploId: string): Promise<PloDetail> {
  const { data } = await api.get<ApiResponse<unknown>>(`/plos/${ploId}`);
  return ploDetailSchema.parse(unwrap(data));
}

export async function createPlo(input: CreatePloInput): Promise<Plo> {
  const { data } = await api.post<ApiResponse<unknown>>('/plos', input);
  return ploSchema.parse(unwrap(data));
}

export async function updatePlo(ploId: string, input: UpdatePloInput): Promise<Plo> {
  const { data } = await api.put<ApiResponse<unknown>>(`/plos/${ploId}`, input);
  return ploSchema.parse(unwrap(data));
}

export async function deletePlo(ploId: string): Promise<void> {
  await api.delete(`/plos/${ploId}`);
}

export async function getPloAttainmentReport(ploId: string): Promise<unknown> {
  const { data } = await api.get<ApiResponse<unknown>>(`/plos/${ploId}/attainment-report`);
  return unwrap(data);
}

// =========================================================================
// 2. CLO Endpoints (/api/v1/courses/{courseId}/clos)
// =========================================================================

export async function getClos(courseId: string): Promise<Clo[]> {
  const { data } = await api.get<ApiResponse<unknown>>(`/courses/${courseId}/clos`);
  const raw = unwrap(data);
  if (Array.isArray(raw)) {
    return raw.map((item) => cloSchema.parse(item));
  }
  return [];
}

export async function getCloById(courseId: string, cloId: string): Promise<CloDetail> {
  const { data } = await api.get<ApiResponse<unknown>>(`/courses/${courseId}/clos/${cloId}`);
  return cloDetailSchema.parse(unwrap(data));
}

export async function createClo(courseId: string, input: CreateCloInput): Promise<Clo> {
  const { data } = await api.post<ApiResponse<unknown>>(`/courses/${courseId}/clos`, input);
  return cloSchema.parse(unwrap(data));
}

export async function updateClo(courseId: string, cloId: string, input: UpdateCloInput): Promise<Clo> {
  const { data } = await api.put<ApiResponse<unknown>>(`/courses/${courseId}/clos/${cloId}`, input);
  return cloSchema.parse(unwrap(data));
}

export async function deleteClo(courseId: string, cloId: string): Promise<void> {
  await api.delete(`/courses/${courseId}/clos/${cloId}`);
}

export async function getCloPloMatrix(courseId: string): Promise<CloPloMatrix> {
  const { data } = await api.get<ApiResponse<unknown>>(`/courses/${courseId}/clo-plo-matrix`);
  return cloPloMatrixSchema.parse(unwrap(data));
}

export async function updateCloPloMatrix(
  courseId: string,
  input: UpdateCloPloMatrixInput
): Promise<CloPloMatrix> {
  const { data } = await api.put<ApiResponse<unknown>>(`/courses/${courseId}/clo-plo-matrix`, input);
  return cloPloMatrixSchema.parse(unwrap(data));
}

export async function getCloConcepts(courseId: string, cloId: string): Promise<CloConcept[]> {
  const { data } = await api.get<ApiResponse<unknown>>(`/courses/${courseId}/clos/${cloId}/concepts`);
  const raw = unwrap(data);
  if (Array.isArray(raw)) {
    return raw;
  }
  return [];
}

export async function updateCloConcepts(
  courseId: string,
  cloId: string,
  input: UpdateCloConceptsInput
): Promise<CloConcept[]> {
  const { data } = await api.put<ApiResponse<unknown>>(
    `/courses/${courseId}/clos/${cloId}/concepts`,
    input
  );
  const raw = unwrap(data);
  return Array.isArray(raw) ? raw : input.concepts;
}

// =========================================================================
// 3. Knowledge Heatmap & Gaps Endpoints (Section 21)
// =========================================================================

export async function getCourseKnowledgeHeatmap(
  courseId: string,
  scope: 'PERSONAL' | 'AGGREGATE' = 'PERSONAL'
): Promise<CourseKnowledgeHeatmap> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/courses/${courseId}/knowledge-heatmap`,
    { params: { scope } }
  );
  return courseKnowledgeHeatmapSchema.parse(unwrap(data));
}

export async function getClassKnowledgeHeatmap(
  classId: string,
  courseId: string,
  page = 0,
  size = 50
): Promise<ClassKnowledgeHeatmap> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/classes/${classId}/knowledge-heatmap`,
    { params: { courseId, page, size } }
  );
  return classKnowledgeHeatmapSchema.parse(unwrap(data));
}

export async function getClassKnowledgeGaps(
  classId: string,
  courseId: string,
  threshold = 50.0
): Promise<ClassKnowledgeGaps> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/classes/${classId}/knowledge-gaps`,
    { params: { courseId, threshold } }
  );
  return classKnowledgeGapsSchema.parse(unwrap(data));
}

export async function getStudentKnowledgeMastery(
  classId: string,
  studentId: string,
  courseId: string
): Promise<unknown> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/classes/${classId}/students/${studentId}/knowledge-mastery`,
    { params: { courseId } }
  );
  return unwrap(data);
}

// =========================================================================
// 4. Outcome Attainment Endpoints (Section 22.4)
// =========================================================================

export async function getClassOutcomeAttainment(
  classId: string,
  courseId: string
): Promise<ClassOutcomeAttainment> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/classes/${classId}/outcome-attainment`,
    { params: { courseId } }
  );
  return classOutcomeAttainmentSchema.parse(unwrap(data));
}

export async function getStudentOutcomeAttainment(
  classId: string,
  studentId: string,
  courseId: string
): Promise<StudentOutcomeAttainment> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/classes/${classId}/students/${studentId}/outcome-attainment`,
    { params: { courseId } }
  );
  return studentOutcomeAttainmentSchema.parse(unwrap(data));
}

export async function getMyOutcomeAttainment(
  classId: string,
  courseId?: string
): Promise<StudentOutcomeAttainment> {
  const params: Record<string, string> = { classId };
  if (courseId) {
    params.courseId = courseId;
  }
  const { data } = await api.get<ApiResponse<unknown>>(
    '/me/outcome-attainment',
    { params }
  );
  return studentOutcomeAttainmentSchema.parse(unwrap(data));
}

export async function recalculateOutcomeAttainment(
  classId: string,
  courseId: string
): Promise<void> {
  await api.post(`/classes/${classId}/outcome-attainment/recalculate`, null, {
    params: { courseId },
  });
}
