import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import {
  type BlockQuizAttemptResponse,
  type LessonBlock,
  type LessonBlocksWorkspaceResponse,
  type LessonBlockType,
  type LessonProgressDetail,
  blockQuizAttemptResponseSchema,
  lessonBlockSchema,
  lessonBlocksWorkspaceResponseSchema,
  lessonProgressDetailSchema,
} from '../schemas/lesson-block.schema';

export interface CreateLessonBlockInput {
  type: LessonBlockType;
  content: Record<string, unknown>;
  orderIndex?: number;
  prevBlockId?: string | null;
  nextBlockId?: string | null;
  materialId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateLessonBlockInput {
  type?: LessonBlockType;
  content?: Record<string, unknown>;
  materialId?: string | null;
  metadata?: Record<string, unknown> | null;
  expectedVersion?: number;
}

export interface BatchUpsertBlockItem {
  id?: string;
  type: LessonBlockType;
  content: Record<string, unknown>;
  orderIndex: number;
  materialId?: string | null;
  metadata?: Record<string, unknown> | null;
  expectedVersion?: number;
}

export interface LessonBlockBatchPayload {
  upserts: BatchUpsertBlockItem[];
  deleteBlockIds: string[];
}

export async function getLessonBlocks(
  lessonId: string
): Promise<LessonBlocksWorkspaceResponse> {
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `/lessons/${lessonId}/blocks`
  );
  const parsed = lessonBlocksWorkspaceResponseSchema.parse(res.data);
  return {
    ...parsed,
    blocks: [...parsed.blocks].sort((a, b) => a.orderIndex - b.orderIndex),
  };
}

export async function createLessonBlock(
  lessonId: string,
  input: CreateLessonBlockInput
): Promise<LessonBlock> {
  const { data: res } = await api.post<ApiResponse<unknown>>(
    `/lessons/${lessonId}/blocks`,
    input
  );
  return lessonBlockSchema.parse(res.data);
}

export async function updateLessonBlock(
  lessonId: string,
  blockId: string,
  input: UpdateLessonBlockInput
): Promise<LessonBlock> {
  const { data: res } = await api.patch<ApiResponse<unknown>>(
    `/lessons/${lessonId}/blocks/${blockId}`,
    input
  );
  return lessonBlockSchema.parse(res.data);
}

export async function reorderLessonBlock(
  lessonId: string,
  blockId: string,
  payload: { orderIndex?: number; prevBlockId?: string | null; nextBlockId?: string | null }
): Promise<LessonBlocksWorkspaceResponse> {
  const { data: res } = await api.patch<ApiResponse<unknown>>(
    `/lessons/${lessonId}/blocks/${blockId}/reorder`,
    payload
  );
  const parsed = lessonBlocksWorkspaceResponseSchema.parse(res.data);
  return {
    ...parsed,
    blocks: [...parsed.blocks].sort((a, b) => a.orderIndex - b.orderIndex),
  };
}

export async function batchSaveLessonBlocks(
  lessonId: string,
  payload: LessonBlockBatchPayload
): Promise<LessonBlocksWorkspaceResponse | LessonBlock[] | void> {
  const { data: res } = await api.patch<ApiResponse<unknown>>(
    `/lessons/${lessonId}/blocks/batch`,
    payload
  );
  if (res?.data && typeof res.data === 'object' && 'blocks' in res.data) {
    const parsed = lessonBlocksWorkspaceResponseSchema.parse(res.data);
    return {
      ...parsed,
      blocks: [...parsed.blocks].sort((a, b) => a.orderIndex - b.orderIndex),
    };
  }
  if (Array.isArray(res?.data)) {
    return res.data.map((item) => lessonBlockSchema.parse(item));
  }
}

export async function deleteLessonBlock(
  lessonId: string,
  blockId: string
): Promise<void> {
  await api.delete(`/lessons/${lessonId}/blocks/${blockId}`);
}

export async function submitBlockQuizAttempt(
  lessonId: string,
  blockId: string,
  selectedIndex: number
): Promise<BlockQuizAttemptResponse> {
  const { data: res } = await api.post<ApiResponse<unknown>>(
    `/lessons/${lessonId}/blocks/${blockId}/quiz-attempt`,
    { selectedIndex }
  );
  return blockQuizAttemptResponseSchema.parse(res.data);
}

export async function saveBlockVideoProgress(
  lessonId: string,
  blockId: string,
  payload: { watchedSeconds: number; durationSeconds: number; isCompleted?: boolean }
): Promise<LessonProgressDetail> {
  const { data: res } = await api.patch<ApiResponse<unknown>>(
    `/lessons/${lessonId}/blocks/${blockId}/video-progress`,
    payload
  );
  return lessonProgressDetailSchema.parse(res.data);
}

export async function updateLessonProgress(
  lessonId: string,
  payload: { isCompleted: boolean; lastAccessedBlockId?: string | null }
): Promise<LessonProgressDetail> {
  const { data: res } = await api.put<ApiResponse<unknown>>(
    `/lessons/${lessonId}/progress`,
    payload
  );
  return lessonProgressDetailSchema.parse(res.data);
}
