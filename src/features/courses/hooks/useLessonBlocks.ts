'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseKeys } from '../constants';
import {
  type LessonBlock,
  type LessonBlocksWorkspaceResponse,
  type LessonBlockType,
} from '../schemas/lesson-block.schema';
import {
  type BatchUpsertBlockItem,
  batchSaveLessonBlocks,
  createLessonBlock,
  deleteLessonBlock,
  getLessonBlocks,
  reorderLessonBlock,
  saveBlockVideoProgress,
  submitBlockQuizAttempt,
  updateLessonProgress,
} from '../services/lesson-block.service';
import {
  computeOrderIndexBetween,
  needsRebalance,
  rebalanceBlockIndices,
} from '../utils/fractional-index';
import { createDefaultBlockContent } from '../components/learning/blocks/block-registry';

export type SaveSyncStatus = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';

export function useLessonBlocks(lessonId: string) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<SaveSyncStatus>('IDLE');

  // Pending dirty upserts keyed by block ID for 1000ms debounce auto-save
  const dirtyBlocksRef = useRef<Map<string, LessonBlock>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const workspaceQuery = useQuery({
    queryKey: courseKeys.lessonBlocks(lessonId),
    queryFn: () => getLessonBlocks(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 2 * 60 * 1000,
  });

  const blocks = workspaceQuery.data?.blocks ?? [];
  const canEdit = workspaceQuery.data?.canEdit ?? false;
  const lessonProgress = workspaceQuery.data?.lessonProgress ?? null;
  const legacyContent = workspaceQuery.data?.legacyContent ?? null;

  const setCachedWorkspace = useCallback(
    (
      updater: (
        prev: LessonBlocksWorkspaceResponse
      ) => LessonBlocksWorkspaceResponse
    ) => {
      queryClient.setQueryData<LessonBlocksWorkspaceResponse>(
        courseKeys.lessonBlocks(lessonId),
        (old) => {
          if (!old) return old;
          return updater(old);
        }
      );
    },
    [lessonId, queryClient]
  );

  const flushPendingSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (dirtyBlocksRef.current.size === 0) return;

    const pending = Array.from(dirtyBlocksRef.current.values());
    dirtyBlocksRef.current.clear();

    const upserts: BatchUpsertBlockItem[] = pending.map((b) => ({
      id: b.id,
      type: b.type,
      content: b.content,
      orderIndex: b.orderIndex,
      materialId: b.materialId ?? null,
      metadata: b.metadata ?? null,
      expectedVersion: b.version,
    }));

    setSaveStatus('SAVING');
    try {
      const result = await batchSaveLessonBlocks(lessonId, {
        upserts,
        deleteBlockIds: [],
      });
      if (result && 'blocks' in result) {
        queryClient.setQueryData(courseKeys.lessonBlocks(lessonId), result);
      } else if (Array.isArray(result)) {
        const versionMap = new Map(result.map((b) => [b.id, b]));
        setCachedWorkspace((prev) => ({
          ...prev,
          blocks: prev.blocks.map((blk) => versionMap.get(blk.id) ?? blk),
        }));
      }
      setSaveStatus('SAVED');
    } catch {
      // Re-queue failed items and mark error
      pending.forEach((b) => dirtyBlocksRef.current.set(b.id, b));
      setSaveStatus('ERROR');
    }
  }, [lessonId, queryClient, setCachedWorkspace]);

  const scheduleAutoSave = useCallback(
    (updatedBlock: LessonBlock) => {
      dirtyBlocksRef.current.set(updatedBlock.id, updatedBlock);
      setSaveStatus('SAVING');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        void flushPendingSave();
      }, 1000);
    },
    [flushPendingSave]
  );

  // Warn user if navigating away with unsaved dirty blocks
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyBlocksRef.current.size > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const addBlockMutation = useMutation({
    mutationFn: async (params: {
      type: LessonBlockType;
      content: Record<string, unknown>;
      afterBlockId?: string | null;
    }) => {
      await flushPendingSave();
      const sorted = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
      let prevBlock: LessonBlock | undefined;
      let nextBlock: LessonBlock | undefined;

      if (params.afterBlockId) {
        const idx = sorted.findIndex((b) => b.id === params.afterBlockId);
        if (idx >= 0) {
          prevBlock = sorted[idx];
          nextBlock = sorted[idx + 1];
        }
      } else {
        prevBlock = sorted[sorted.length - 1];
      }

      const orderIndex = computeOrderIndexBetween(
        prevBlock?.orderIndex,
        nextBlock?.orderIndex
      );

      return createLessonBlock(lessonId, {
        type: params.type,
        content: params.content,
        orderIndex,
        prevBlockId: prevBlock?.id ?? null,
        nextBlockId: nextBlock?.id ?? null,
      });
    },
    onSuccess: (created) => {
      setCachedWorkspace((prev) => ({
        ...prev,
        blocks: [...prev.blocks, created].sort(
          (a, b) => a.orderIndex - b.orderIndex
        ),
      }));
      setSaveStatus('SAVED');
    },
    onError: () => {
      setSaveStatus('ERROR');
    },
  });

  const updateBlockLocal = useCallback(
    (
      blockId: string,
      patch: { type?: LessonBlockType; content?: Record<string, unknown> }
    ) => {
      let modified: LessonBlock | null = null;
      setCachedWorkspace((prev) => ({
        ...prev,
        blocks: prev.blocks.map((blk) => {
          if (blk.id !== blockId) return blk;
          modified = {
            ...blk,
            type: patch.type ?? blk.type,
            content: patch.content ?? blk.content,
          };
          return modified;
        }),
      }));
      if (modified) {
        scheduleAutoSave(modified);
      }
    },
    [scheduleAutoSave, setCachedWorkspace]
  );

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      dirtyBlocksRef.current.delete(blockId);
      await deleteLessonBlock(lessonId, blockId);
      return blockId;
    },
    onMutate: async (blockId) => {
      const prev = queryClient.getQueryData<LessonBlocksWorkspaceResponse>(
        courseKeys.lessonBlocks(lessonId)
      );
      setCachedWorkspace((curr) => ({
        ...curr,
        blocks: curr.blocks.filter((b) => b.id !== blockId),
      }));
      return { prev };
    },
    onError: (_err, _blockId, context) => {
      if (context?.prev) {
        queryClient.setQueryData(courseKeys.lessonBlocks(lessonId), context.prev);
      }
      setSaveStatus('ERROR');
    },
    onSuccess: () => {
      setSaveStatus('SAVED');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      blockId,
      targetIndex,
    }: {
      blockId: string;
      targetIndex: number;
    }) => {
      await flushPendingSave();
      const sorted = [...blocks]
        .filter((b) => b.id !== blockId)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const boundedIdx = Math.max(0, Math.min(targetIndex, sorted.length));
      const prevBlock = sorted[boundedIdx - 1];
      const nextBlock = sorted[boundedIdx];
      const newOrderIndex = computeOrderIndexBetween(
        prevBlock?.orderIndex,
        nextBlock?.orderIndex
      );

      // Optimistic local reorder
      setCachedWorkspace((curr) => {
        const moving = curr.blocks.find((b) => b.id === blockId);
        if (!moving) return curr;
        let nextList = curr.blocks
          .map((b) =>
            b.id === blockId ? { ...b, orderIndex: newOrderIndex } : b
          )
          .sort((a, b) => a.orderIndex - b.orderIndex);
        if (needsRebalance(prevBlock?.orderIndex, nextBlock?.orderIndex)) {
          nextList = rebalanceBlockIndices(nextList);
        }
        return { ...curr, blocks: nextList };
      });

      return reorderLessonBlock(lessonId, blockId, {
        orderIndex: newOrderIndex,
        prevBlockId: prevBlock?.id ?? null,
        nextBlockId: nextBlock?.id ?? null,
      });
    },
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(
        courseKeys.lessonBlocks(lessonId),
        updatedWorkspace
      );
      setSaveStatus('SAVED');
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: courseKeys.lessonBlocks(lessonId),
      });
      setSaveStatus('ERROR');
    },
  });

  const quizAttemptMutation = useMutation({
    mutationFn: ({
      blockId,
      selectedIndex,
    }: {
      blockId: string;
      selectedIndex: number;
    }) => submitBlockQuizAttempt(lessonId, blockId, selectedIndex),
    onSuccess: (res) => {
      setCachedWorkspace((prev) => ({
        ...prev,
        lessonProgress: prev.lessonProgress
          ? {
              ...prev.lessonProgress,
              progressPercent:
                res.lessonProgressPercent ?? prev.lessonProgress.progressPercent,
              status: res.lessonStatus ?? prev.lessonProgress.status,
            }
          : prev.lessonProgress,
        blocks: prev.blocks.map((blk) => {
          if (blk.id !== res.blockId) return blk;
          return {
            ...blk,
            content: {
              ...blk.content,
              ...(res.correctIndex !== undefined && res.correctIndex !== null
                ? { correctIndex: res.correctIndex }
                : {}),
              ...(res.explanation ? { explanation: res.explanation } : {}),
            },
            studentState: {
              isCompleted: res.isCorrect,
              interactionState: {
                selectedIndex: res.selectedIndex,
                isCorrect: res.isCorrect,
              },
            },
          };
        }),
      }));
    },
  });

  const videoProgressMutation = useMutation({
    mutationFn: ({
      blockId,
      watchedSeconds,
      durationSeconds,
      isCompleted,
    }: {
      blockId: string;
      watchedSeconds: number;
      durationSeconds: number;
      isCompleted?: boolean;
    }) =>
      saveBlockVideoProgress(lessonId, blockId, {
        watchedSeconds,
        durationSeconds,
        isCompleted,
      }),
    onSuccess: (progress) => {
      setCachedWorkspace((prev) => ({
        ...prev,
        lessonProgress: progress,
      }));
    },
  });

  const completeLessonMutation = useMutation({
    mutationFn: (payload: {
      isCompleted: boolean;
      lastAccessedBlockId?: string | null;
    }) => updateLessonProgress(lessonId, payload),
    onSuccess: (progress) => {
      setCachedWorkspace((prev) => ({
        ...prev,
        lessonProgress: progress,
      }));
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async ({
      blockTypes,
      lessonTitle,
    }: {
      blockTypes: LessonBlockType[];
      lessonTitle?: string;
    }) => {
      const upserts: BatchUpsertBlockItem[] = blockTypes.map((t, idx) => ({
        type: t,
        content:
          t === 'HEADING' && lessonTitle
            ? { level: 1, text: lessonTitle }
            : createDefaultBlockContent(t),
        orderIndex: (idx + 1) * 1000.0,
      }));
      return batchSaveLessonBlocks(lessonId, { upserts, deleteBlockIds: [] });
    },
    onSuccess: (res) => {
      if (res && 'blocks' in res) {
        queryClient.setQueryData(courseKeys.lessonBlocks(lessonId), res);
      } else {
        queryClient.invalidateQueries({
          queryKey: courseKeys.lessonBlocks(lessonId),
        });
      }
      setSaveStatus('SAVED');
    },
    onError: () => {
      setSaveStatus('ERROR');
    },
  });

  return {
    workspace: workspaceQuery.data,
    blocks,
    canEdit,
    lessonProgress,
    legacyContent,
    isLoading: workspaceQuery.isLoading,
    isError: workspaceQuery.isError,
    refetch: workspaceQuery.refetch,
    saveStatus,
    flushPendingSave,
    addBlockMutation,
    updateBlockLocal,
    deleteBlockMutation,
    reorderMutation,
    quizAttemptMutation,
    videoProgressMutation,
    completeLessonMutation,
    applyTemplateMutation,
  };
}
