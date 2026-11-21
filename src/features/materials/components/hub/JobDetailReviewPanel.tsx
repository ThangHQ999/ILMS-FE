'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/types/common';
import { DraftGraphEditor } from '../../DraftGraphEditor';
import {
  useIngestionJobDetail,
  useRetryIngestionJobMutation,
  useReviewIngestionDraftMutation,
  useSaveDraftRevisionMutation,
} from '../../hooks/useIngestionJobs';
import { downloadIngestionSourceFile } from '../../services/ingestion.service';
import {
  extractValidationSummary,
  isActiveIngestionJobStatus,
  isCompletedIngestionJobStatus,
  type IngestionDraft,
  type IngestionJobSummary,
  type ReviewDecision,
} from '../../schemas/ingestion.schema';
import { PipelineStepper } from './PipelineStepper';
import { DraftEntitiesChecklist } from './DraftEntitiesChecklist';

interface JobDetailReviewPanelProps {
  jobId: string | null;
  summary?: IngestionJobSummary | null;
  onShowToast?: (msg: string) => void;
}

export function JobDetailReviewPanel({
  jobId,
  summary,
  onShowToast,
}: JobDetailReviewPanelProps) {
  const tActions = useTranslations('materialsHub.actions');
  const {
    data: job,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useIngestionJobDetail(jobId);

  const saveDraftMutation = useSaveDraftRevisionMutation();
  const reviewDraftMutation = useReviewIngestionDraftMutation();
  const retryMutation = useRetryIngestionJobMutation();

  const [activeDraft, setActiveDraft] = useState<IngestionDraft | null>(null);
  const [graphText, setGraphText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [saveError, setSaveError] = useState('');
  const [activeReviewTab, setActiveReviewTab] = useState<'graph' | 'entities'>('graph');
  const [isRawJsonOpen, setIsRawJsonOpen] = useState(false);
  const [rawJsonSection, setRawJsonSection] = useState<'graph' | 'validation' | 'source'>('graph');
  const [reviewComment, setReviewComment] = useState('');

  // Sync draft state whenever job or revision changes from server
  const serverDraftId = job?.draft?.id ?? null;
  const serverDraftHash = job?.draft?.hash ?? null;
  useEffect(() => {
    if (!job?.draft) {
      setActiveDraft(null);
      setGraphText('');
      setSavedText('');
      setSaveError('');
      return;
    }
    const serialized = JSON.stringify(job.draft.graph ?? {}, null, 2);
    setActiveDraft(job.draft);
    setGraphText(serialized);
    setSavedText(serialized);
    setSaveError('');
  }, [job?.jobId, serverDraftId, serverDraftHash, job?.draft]);

  const isDirty = graphText !== savedText;
  const isAwaitingReview = job?.status === 'AWAITING_REVIEW';
  const isEditable = Boolean(activeDraft && isAwaitingReview);
  const isBusy = reviewDraftMutation.isPending || retryMutation.isPending;

  // Debounced autosave (800ms) with optimistic concurrency (baseRevisionId + baseHash)
  useEffect(() => {
    if (
      !isEditable ||
      !activeDraft ||
      !jobId ||
      !isDirty ||
      isBusy ||
      saveDraftMutation.isPending ||
      saveError
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
          onSuccess: (nextRevision) => {
            setActiveDraft(nextRevision);
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
  }, [
    activeDraft,
    graphText,
    isBusy,
    isDirty,
    isEditable,
    jobId,
    saveDraftMutation,
    saveError,
  ]);

  const validationSummary = useMemo(
    () => extractValidationSummary(activeDraft),
    [activeDraft]
  );

  if (!jobId) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[480px] gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-[30px]">fact_check</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Chọn một tiến trình bên trái để xem chi tiết
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Theo dõi 5 chặng xử lý của AI 4-Agents, kiểm tra cảnh báo BLOCKER, đối chiếu bằng chứng nguồn và duyệt xuất bản lên Neo4j &amp; ChromaDB.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 animate-pulse min-h-[480px]">
        <div className="h-7 w-2/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-24 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-72 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-[26px]">error</span>
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Không thể tải chi tiết tiến trình
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Job ID: <code className="font-mono">{jobId}</code>
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="px-4 py-2 rounded-xl bg-[#0059bb] text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const displayTitle = job.title || summary?.title || `Tài liệu #${job.jobId.slice(0, 8)}`;
  const displayCourseTitle = job.courseTitle || summary?.courseTitle || job.subject || summary?.subject;
  const displayCourseId = job.courseId || summary?.courseId;
  const displayMaterialId = job.materialId || summary?.materialId;
  const isCompleted = isCompletedIngestionJobStatus(job.status);
  const isActive = isActiveIngestionJobStatus(job.status);
  const canReviewDecision = Boolean(isAwaitingReview && activeDraft);

  const executeReview = (decision: ReviewDecision, overrideBlocker = false) => {
    if (!activeDraft || !jobId) return;

    if (decision === 'APPROVED' && validationSummary.blockerIssues.length > 0 && !overrideBlocker) {
      if (
        window.confirm(
          `Bản nháp vẫn còn ${validationSummary.blockerIssues.length} cảnh báo BLOCKER. Bạn có chắc chắn muốn DUYỆT CƯỠNG CHẾ và xuất bản lên Neo4j không?`
        )
      ) {
        executeReview('APPROVED', true);
      }
      return;
    }

    reviewDraftMutation.mutate(
      {
        jobId,
        baseRevisionId: activeDraft.id,
        baseHash: activeDraft.hash,
        decision,
        comment: reviewComment,
      },
      {
        onSuccess: () => {
          setReviewComment('');
          if (decision === 'APPROVED') {
            onShowToast?.('Đã duyệt bản nháp! Hệ thống đang xuất bản sang Neo4j & ChromaDB.');
          } else if (decision === 'CHANGES_REQUESTED') {
            onShowToast?.('Đã gửi yêu cầu chỉnh sửa bản nháp.');
          } else {
            onShowToast?.('Đã từ chối bản nháp này.');
          }
        },
        onError: (err) => {
          onShowToast?.(
            err instanceof Error ? err.message : 'Không thể gửi quyết định duyệt bản nháp.'
          );
        },
      }
    );
  };

  const handleReviewDecision = (decision: ReviewDecision) => {
    if (!activeDraft || !jobId) return;

    // If there are unsaved local modifications, flush and save first then proceed
    if (isDirty) {
      try {
        const candidate = JSON.parse(graphText);
        saveDraftMutation.mutate(
          {
            jobId,
            baseRevisionId: activeDraft.id,
            baseHash: activeDraft.hash,
            graph: candidate,
          },
          {
            onSuccess: (nextRev) => {
              setActiveDraft(nextRev);
              setSavedText(graphText);
              setSaveError('');
              executeReview(decision);
            },
            onError: (err) => {
              onShowToast?.(
                err instanceof Error ? err.message : 'Không thể tự động lưu thay đổi trước khi duyệt.'
              );
            },
          }
        );
        return;
      } catch {
        onShowToast?.('Dữ liệu JSON đang bị lỗi cú pháp, vui lòng kiểm tra lại trước khi duyệt.');
        return;
      }
    }

    executeReview(decision);
  };

  const handleManualSave = () => {
    if (!activeDraft || !jobId || !isDirty) return;
    try {
      const candidate = JSON.parse(graphText);
      saveDraftMutation.mutate(
        {
          jobId,
          baseRevisionId: activeDraft.id,
          baseHash: activeDraft.hash,
          graph: candidate,
        },
        {
          onSuccess: (nextRev) => {
            setActiveDraft(nextRev);
            setSavedText(graphText);
            setSaveError('');
            onShowToast?.('Đã lưu thành công các thay đổi trên bản nháp.');
          },
          onError: (err) => {
            const apiErr = err as ApiError;
            setSaveError(apiErr.message || 'Không thể lưu bản nháp.');
          },
        }
      );
    } catch {
      onShowToast?.('Dữ liệu JSON không hợp lệ.');
    }
  };

  const handleRetry = () => {
    retryMutation.mutate(job.jobId, {
      onSuccess: () => {
        onShowToast?.('Đã xếp hàng chạy lại tiến trình bóc tách AI.');
      },
      onError: (err) => {
        onShowToast?.(err instanceof Error ? err.message : 'Không thể thử lại tiến trình.');
      },
    });
  };

  const handleDownloadSource = async () => {
    if (!displayMaterialId) return;
    try {
      await downloadIngestionSourceFile(displayMaterialId, job.jobId, displayTitle);
      onShowToast?.(`Đang tải tệp gốc "${displayTitle}"...`);
    } catch {
      onShowToast?.('Không thể tải xuống tệp gốc của tiến trình này.');
    }
  };

  const graphHref = displayCourseId
    ? `/courses/${displayCourseId}?tab=knowledgeGraph${
        displayMaterialId ? `&materialId=${encodeURIComponent(displayMaterialId)}` : ''
      }`
    : displayMaterialId
      ? `/knowledge-graph?materialId=${encodeURIComponent(displayMaterialId)}`
      : '/knowledge-graph';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">
                {displayTitle}
              </h2>
              {isFetching && !isLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                  Live
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
              {displayCourseTitle && (
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {displayCourseTitle}
                </span>
              )}
              <span className="font-mono text-[11px]">Job: {job.jobId.slice(0, 12)}…</span>
              {activeDraft && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Rev #{activeDraft.revision} · {activeDraft.reviewStatus}
                </span>
              )}
              {isEditable && (
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                    saveDraftMutation.isPending
                      ? 'text-blue-600 dark:text-blue-400'
                      : isDirty
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {saveDraftMutation.isPending ? (
                    '• Đang tự động lưu...'
                  ) : isDirty ? (
                    <>
                      <span>• Chưa lưu thay đổi</span>
                      <button
                        type="button"
                        onClick={handleManualSave}
                        className="underline hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer font-bold"
                      >
                        (Lưu ngay)
                      </button>
                    </>
                  ) : (
                    '• Đã đồng bộ máy chủ'
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Buttons: Review Decision Group & Secondary Tools */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Prominent Review Action Strip when AWAITING_REVIEW */}
            {isAwaitingReview && activeDraft && (
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleReviewDecision('APPROVED')}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                  title="Duyệt bản nháp và kích hoạt xuất bản đồ thị lên Neo4j & ChromaDB"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{reviewDraftMutation.isPending ? 'Đang gửi...' : 'Duyệt & Xuất bản'}</span>
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleReviewDecision('CHANGES_REQUESTED')}
                  className="px-2.5 py-1.5 rounded-xl text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                  title="Yêu cầu chỉnh sửa bản nháp"
                >
                  Yêu cầu sửa
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleReviewDecision('REJECTED')}
                  className="px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                  title="Từ chối bản nháp này"
                >
                  Từ chối
                </button>
              </div>
            )}

            {displayMaterialId && (
              <button
                type="button"
                onClick={() => void handleDownloadSource()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{tActions('downloadSource')}</span>
              </button>
            )}

            {activeDraft && (
              <button
                type="button"
                onClick={() => setIsRawJsonOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  isRawJsonOpen
                    ? 'bg-slate-900 text-emerald-400 border-slate-700 dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Mở bảng kiểm tra JSON thô cho kỹ thuật (graph_payload, validation_report, source)"
              >
                <span>&lt;/&gt; {tActions('rawJson')}</span>
              </button>
            )}

            {job.status === 'FAILED' && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={retryMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>{retryMutation.isPending ? 'Đang gửi lại...' : tActions('retry')}</span>
              </button>
            )}

            {isCompleted && (
              <Link
                href={graphHref}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">hub</span>
                <span>{tActions('viewPublishedGraph')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* 5-Step Real Pipeline Tracker */}
        <PipelineStepper
          status={job.status}
          stage={job.stage}
          errorCode={job.errorCode}
        />
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 space-y-5 flex-1 text-left">
        {/* Error Banner if FAILED */}
        {job.status === 'FAILED' && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              error_outline
            </span>
            <div className="text-xs space-y-1">
              <div className="font-bold text-rose-800 dark:text-rose-200">
                Tiến trình thất bại{job.errorCode ? ` (${job.errorCode})` : ''}
              </div>
              <p className="text-rose-700 dark:text-rose-300">
                {job.errorMessage ||
                  'Quá trình trích xuất hoặc xuất bản bị gián đoạn (có thể do quá hạn lease 15 phút hoặc file không đọc được text). Bạn có thể bấm "Thử chạy lại".'}
              </p>
            </div>
          </div>
        )}

        {/* Active Processing Notice */}
        {isActive && (
          <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400 animate-spin shrink-0 mt-0.5">
              progress_activity
            </span>
            <div className="text-xs space-y-1">
              <div className="font-bold text-blue-800 dark:text-blue-200">
                {job.status === 'QUEUED'
                  ? 'Đang chờ Worker Spring Boot nhận tác vụ (quét mỗi 3s)...'
                  : job.status === 'PUBLISHING'
                    ? 'Đang ghi Đồ thị Neo4j, tạo Vector ChromaDB và kích hoạt MySQL...'
                    : 'FastAPI đang chạy Pipeline 4 Agent AI (Extractor → Expert → Validator → Reviewer)...'}
              </div>
              <p className="text-blue-700/80 dark:text-blue-300/80">
                Trang đang tự động cập nhật trạng thái mỗi 2.5 giây. Bạn không cần tải lại trình duyệt.
              </p>
            </div>
          </div>
        )}

        {/* Validation Alerts: BLOCKER / WARNING / parser_warnings / review_notes */}
        {validationSummary.blockerIssues.length > 0 && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200">
                <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
                <span>
                  Phát hiện {validationSummary.blockerIssues.length} lỗi BLOCKER cần xử lý trước khi xuất bản
                </span>
              </div>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                (Dùng các nút CRUD bên dưới để sửa/xóa liên kết lỗi)
              </span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-rose-700 dark:text-rose-300">
              {validationSummary.blockerIssues.map((issue, idx) => (
                <li key={`blocker-${idx}`}>
                  {issue.code ? <strong className="font-mono">[{issue.code}] </strong> : null}
                  {issue.message || issue.reason || 'Lỗi cấu trúc liên kết tri thức'}
                  {issue.path ? <span className="opacity-75"> ({issue.path})</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(validationSummary.parserWarnings.length > 0 ||
          validationSummary.warningIssues.length > 0 ||
          validationSummary.reviewNotes.length > 0) && (
          <div className="rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Cảnh báo Parser &amp; Ghi chú từ AI Reviewer</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-amber-800/90 dark:text-amber-200/90">
              {validationSummary.parserWarnings.map((w, idx) => (
                <li key={`pw-${idx}`}>[Parser] {w}</li>
              ))}
              {validationSummary.warningIssues.map((issue, idx) => (
                <li key={`warn-${idx}`}>
                  {issue.code ? <strong className="font-mono">[{issue.code}] </strong> : null}
                  {issue.message || issue.reason || 'Cảnh báo chất lượng dữ liệu'}
                </li>
              ))}
              {validationSummary.reviewNotes.map((note, idx) => (
                <li key={`note-${idx}`}>[Reviewer] {note}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Save Error / Conflict Recovery */}
        {saveError && (
          <div
            role="alert"
            className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-200"
          >
            <span>{saveError}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSaveError('')}
                className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 font-bold border border-rose-200 dark:border-rose-800 cursor-pointer"
              >
                Thử lưu lại
              </button>
              <button
                type="button"
                onClick={() => void refetch()}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
              >
                Tải bản máy chủ
              </button>
            </div>
          </div>
        )}

        {/* Draft Review Studio (Tabs + Optional Raw JSON Drawer) */}
        {activeDraft && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('graph')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeReviewTab === 'graph'
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>Đồ thị nháp trực quan (Canvas CRUD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('entities')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeReviewTab === 'entities'
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                  <span>Danh sách Thực thể &amp; Bằng chứng (CRUD List)</span>
                </button>
              </div>

              {isDirty && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualSave}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Lưu thay đổi ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bỏ các chỉnh sửa chưa lưu và tải lại bản từ máy chủ?')) {
                        void refetch();
                      }
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                  >
                    Hoàn tác
                  </button>
                </div>
              )}
            </div>

            {activeReviewTab === 'graph' ? (
              <DraftGraphEditor
                key={`${job.jobId}-${activeDraft.id}`}
                jobId={job.jobId}
                revisionId={activeDraft.id}
                jobStatus={job.status}
                text={graphText}
                editable={isEditable && !isBusy}
                onChange={setGraphText}
              />
            ) : (
              <DraftEntitiesChecklist
                draft={activeDraft}
                text={graphText}
                editable={isEditable && !isBusy}
                onChange={setGraphText}
              />
            )}

            {/* Compact </> Raw JSON Drawer for Dev/Advanced inspection */}
            {isRawJsonOpen && (
              <div className="rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        ['graph', 'graph_payload'],
                        ['validation', 'validation_report'],
                        ['source', 'source_evidence'],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRawJsonSection(key)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                          rawJsonSection === key
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRawJsonOpen(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                {rawJsonSection === 'graph' ? (
                  <textarea
                    value={graphText}
                    readOnly={!isEditable || isBusy}
                    onChange={(e) => setGraphText(e.target.value)}
                    spellCheck={false}
                    className="w-full min-h-72 rounded-xl bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <pre className="max-h-72 overflow-auto rounded-xl bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-slate-200 whitespace-pre-wrap">
                    {JSON.stringify(
                      rawJsonSection === 'validation'
                        ? activeDraft.validation ?? {}
                        : activeDraft.source ?? {},
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Persistent Review Action Footer when AWAITING_REVIEW */}
      {canReviewDecision && (
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-amber-500">
                rate_review
              </span>
              <span>Khu vực Phê duyệt &amp; Quyết định Xuất bản Đồ thị</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Trạng thái: <strong>AWAITING_REVIEW</strong> (Giảng viên có quyền sửa đổi và xuất bản)
            </span>
          </div>

          <input
            type="text"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Ghi chú duyệt / lý do yêu cầu chỉnh sửa (tùy chọn)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleReviewDecision('CHANGES_REQUESTED')}
                className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-800 dark:text-amber-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                {tActions('requestChanges')}
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleReviewDecision('REJECTED')}
                className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                {tActions('reject')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {validationSummary.blockerIssues.length > 0 && (
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">warning</span>
                  <span>{validationSummary.blockerIssues.length} BLOCKER</span>
                </span>
              )}

              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleReviewDecision('APPROVED')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[17px]">verified</span>
                <span>
                  {reviewDraftMutation.isPending
                    ? 'Đang gửi duyệt...'
                    : tActions('approveAndPublish')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
