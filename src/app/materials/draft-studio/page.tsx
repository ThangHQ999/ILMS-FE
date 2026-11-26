'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ApiError } from '@/types/common';
import {
  useIngestionJobDetail,
  useSaveDraftRevisionMutation,
} from '@/features/materials';
import { DraftGraphEditor } from '@/features/materials';

function DraftStudioPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const jobId = searchParams.get('jobId');
  const revisionIdParam = searchParams.get('revisionId');

  const { data: job, isLoading: isJobLoading, isError: isJobError } = useIngestionJobDetail(jobId);

  // If job has a draft, use it; otherwise create a safe fallback draft so the studio never crashes
  const activeDraft = useMemo(() => {
    if (!job) return null;
    if (job.draft) return job.draft;
    return {
      id: revisionIdParam || `draft-${job.jobId}`,
      revision: 1,
      hash: '',
      reviewStatus: job.status || 'PENDING_REVIEW',
      graph: {},
      source: {},
    };
  }, [job, revisionIdParam]);

  const [graphText, setGraphText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [, setSaveError] = useState('');

  // Sync draft state whenever job or draft revision changes from server
  const serverDraftId = activeDraft?.id ?? null;
  const serverDraftHash = activeDraft?.hash ?? null;

  useEffect(() => {
    if (!activeDraft) {
      setGraphText('');
      setSavedText('');
      setSaveError('');
      return;
    }
    const initialGraph = activeDraft.graph ?? {};
    const serialized = JSON.stringify(initialGraph, null, 2);
    setGraphText(serialized);
    setSavedText(serialized);
    setSaveError('');
  }, [job?.jobId, serverDraftId, serverDraftHash, activeDraft]);

  const isDirty = graphText !== savedText;
  const isAwaitingReview = job?.status === 'AWAITING_REVIEW';
  const isEditable = Boolean(activeDraft && isAwaitingReview);
  const saveDraftMutation = useSaveDraftRevisionMutation();

  // Debounced autosave (800ms) with optimistic concurrency (baseRevisionId + baseHash)
  useEffect(() => {
    if (
      !isEditable ||
      !activeDraft ||
      !jobId ||
      !isDirty ||
      saveDraftMutation.isPending
    ) {
      return;
    }

    let parsedGraph: Record<string, unknown>;
    try {
      const candidate = JSON.parse(graphText);
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return;
      parsedGraph = candidate as Record<string, unknown>;
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      saveDraftMutation.mutate(
        {
          jobId,
          baseRevisionId: activeDraft.id,
          baseHash: activeDraft.hash,
          graph: parsedGraph,
        },
        {
          onSuccess: () => {
            setSavedText(graphText);
            setSaveError('');
          },
          onError: (err) => {
            const apiErr = err as ApiError;
            setSaveError(
              apiErr.httpStatus === 409
                ? 'Bản nháp đã thay đổi trên máy chủ (409 Conflict). Hãy tải lại bản mới nhất trước khi tiếp tục.'
                : apiErr.message || 'Không thể lưu bản nháp.'
            );
          },
        }
      );
    }, 800);

    return () => clearTimeout(timer);
  }, [activeDraft, graphText, isDirty, isEditable, jobId, saveDraftMutation]);

  if (!jobId) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-white text-center">
        <span className="material-symbols-outlined text-5xl text-amber-500 mb-3">warning</span>
        <h1 className="text-xl font-bold mb-2">Không tìm thấy mã tiến trình tài liệu (jobId)</h1>
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          Đường dẫn không hợp lệ hoặc thiếu thông tin phiên bản đồ thị bản nháp cần chỉnh sửa.
        </p>
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-lg"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Quay lại trang Quản lý tài liệu</span>
        </Link>
      </div>
    );
  }

  if (isJobLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-300 font-medium">Đang tải toàn bộ dữ liệu Đồ thị bản nháp Studio...</p>
      </div>
    );
  }

  if (isJobError || !job || !activeDraft) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-white text-center">
        <span className="material-symbols-outlined text-5xl text-rose-500 mb-3">error</span>
        <h1 className="text-xl font-bold mb-2">Không thể tải đồ thị bản nháp</h1>
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          Tiến trình tài liệu hoặc bản nháp không tồn tại, hoặc bạn không có quyền truy cập.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/materials?jobId=${jobId}`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Quay lại Quản lý tài liệu</span>
        </button>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#0B0F19] select-none">
      <DraftGraphEditor
        key={`dedicated-${job.jobId}-${activeDraft.id}`}
        jobId={job.jobId}
        revisionId={activeDraft.id}
        jobStatus={job.status}
        courseId={job.courseId}
        courseTitle={job.courseTitle ?? undefined}
        text={graphText}
        editable={isEditable}
        onChange={setGraphText}
        isDedicatedRoute={true}
        onExitDedicatedRoute={() => router.push(`/materials?jobId=${job.jobId}`)}
      />
    </main>
  );
}

export default function DraftStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DraftStudioPageContent />
    </Suspense>
  );
}
