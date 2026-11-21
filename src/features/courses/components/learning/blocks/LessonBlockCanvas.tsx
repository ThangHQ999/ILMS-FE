'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MarkdownContent } from '@/components/shared';
import { askOwlAboutBlock } from '@/hooks/useSocraticLessonContext';
import type { LessonBlock, LessonBlockType } from '../../../schemas/lesson-block.schema';
import type { SaveSyncStatus } from '../../../hooks/useLessonBlocks';
import { BlockWrapper } from './BlockWrapper';
import { SlashCommandMenu } from './SlashCommandMenu';
import {
  CalloutBlock,
  DividerBlock,
  HeadingBlock,
  ImageBlock,
  TextBlock,
} from './BasicBlocks';
import { VideoBlock } from './VideoBlock';
import { SlideBlock } from './SlideBlock';
import { CodeSandboxBlock } from './CodeSandboxBlock';
import { QuizBlock } from './QuizBlock';
import { DiagramBlock } from './DiagramBlock';
import { extractBlockSocraticContext } from './block-registry';

interface LessonBlockCanvasProps {
  lessonTitle: string;
  lessonDurationMinutes?: number;
  isPublished?: boolean;
  blocks: LessonBlock[];
  canEdit: boolean;
  isEditorMode: boolean;
  onToggleEditorMode: () => void;
  legacyContent?: string | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  saveStatus: SaveSyncStatus;
  onFlushSave: () => void;
  onUpdateLessonMeta?: (patch: {
    title?: string;
    durationSeconds?: number;
    isPublished?: boolean;
  }) => void;
  onApplyTemplate?: (blockTypes: LessonBlockType[]) => void;
  isApplyingTemplate?: boolean;
  onAddBlock: (
    type: LessonBlockType,
    afterBlockId?: string | null
  ) => void;
  onUpdateBlock: (
    blockId: string,
    patch: { type?: LessonBlockType; content?: Record<string, unknown> }
  ) => void;
  onReorderBlock: (blockId: string, targetIndex: number) => void;
  onDeleteBlock: (blockId: string) => void;
  onSubmitQuizAttempt: (blockId: string, selectedIndex: number) => void;
  isQuizSubmitting?: boolean;
  onVideoProgress: (
    blockId: string,
    watchedSeconds: number,
    durationSeconds: number
  ) => void;
  onToast: (msg: string) => void;
}

export function LessonBlockCanvas({
  lessonTitle,
  lessonDurationMinutes = 45,
  isPublished = true,
  blocks,
  canEdit,
  isEditorMode,
  onToggleEditorMode,
  legacyContent,
  isLoading,
  isError,
  onRetry,
  saveStatus,
  onFlushSave,
  onUpdateLessonMeta,
  onApplyTemplate,
  isApplyingTemplate = false,
  onAddBlock,
  onUpdateBlock,
  onReorderBlock,
  onDeleteBlock,
  onSubmitQuizAttempt,
  isQuizSubmitting = false,
  onVideoProgress,
  onToast,
}: LessonBlockCanvasProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(lessonTitle);
  const [draftDuration, setDraftDuration] = useState(lessonDurationMinutes);

  useEffect(() => {
    setDraftTitle(lessonTitle);
  }, [lessonTitle]);

  useEffect(() => {
    setDraftDuration(lessonDurationMinutes);
  }, [lessonDurationMinutes]);

  const commitTitleChange = () => {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== lessonTitle && onUpdateLessonMeta) {
      onUpdateLessonMeta({ title: trimmed });
    }
  };

  const commitDurationChange = () => {
    const mins = Math.max(1, Number(draftDuration) || 45);
    if (mins !== lessonDurationMinutes && onUpdateLessonMeta) {
      onUpdateLessonMeta({ durationSeconds: mins * 60 });
    }
  };

  const tocHeadings = useMemo(
    () =>
      blocks
        .filter((b) => b.type === 'HEADING')
        .map((b) => ({
          id: b.id,
          text: String((b.content as Record<string, unknown>).text || ''),
        }))
        .filter((h) => h.text.trim().length > 0),
    [blocks]
  );

  const handleDropOn = (targetBlockId: string) => {
    if (!draggedId || draggedId === targetBlockId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const targetIdx = blocks.findIndex((b) => b.id === targetBlockId);
    if (targetIdx >= 0) {
      onReorderBlock(draggedId, targetIdx);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const renderBlockBody = (block: LessonBlock, idx: number) => {
    const handleContentChange = (nextContent: Record<string, unknown>) =>
      onUpdateBlock(block.id, { content: nextContent });

    switch (block.type) {
      case 'HEADING':
        return (
          <HeadingBlock
            content={block.content}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
          />
        );
      case 'TEXT':
        return (
          <TextBlock
            content={block.content}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
            onOpenSlashMenu={() => setIsBottomMenuOpen(true)}
          />
        );
      case 'CALLOUT':
        return (
          <CalloutBlock
            content={block.content}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
          />
        );
      case 'IMAGE':
        return (
          <ImageBlock
            content={block.content}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
          />
        );
      case 'DIVIDER':
        return <DividerBlock />;
      case 'VIDEO':
        return (
          <VideoBlock
            content={block.content}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
            onVideoProgress={(watched, total) =>
              onVideoProgress(block.id, watched, total)
            }
          />
        );
      case 'SLIDE':
        return (
          <SlideBlock
            content={block.content}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
          />
        );
      case 'CODE_SANDBOX':
        return (
          <CodeSandboxBlock
            content={block.content}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
          />
        );
      case 'QUIZ':
        return (
          <QuizBlock
            block={block}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
            onSubmitAttempt={(selectedIdx) =>
              onSubmitQuizAttempt(block.id, selectedIdx)
            }
            isSubmitting={isQuizSubmitting}
          />
        );
      case 'DIAGRAM':
        return (
          <DiagramBlock
            content={block.content}
            isEditorMode={isEditorMode}
            onChange={handleContentChange}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl w-full mx-auto space-y-4 animate-pulse">
        <div className="h-10 w-2/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-[36px] text-rose-500 mb-2">
          cloud_off
        </span>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Không thể tải nội dung khối bài học
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Vui lòng kiểm tra kết nối Backend API và thử lại.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold border-none cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col gap-5">
      {/* Canvas Top Bar: Lesson Title, Mode Switch & Auto-save Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="min-w-0 flex-1">
          {isEditorMode ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={commitTitleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Nhập tiêu đề bài học..."
                className="w-full bg-transparent border-none outline-none text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight placeholder:text-slate-400"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={draftDuration}
                    onChange={(e) => setDraftDuration(Number(e.target.value) || 45)}
                    onBlur={commitDurationChange}
                    className="w-12 bg-transparent border-none outline-none font-bold text-slate-900 dark:text-slate-100 text-xs text-center"
                  />
                  <span>phút</span>
                </label>

                {onUpdateLessonMeta && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateLessonMeta({ isPublished: !isPublished })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] border cursor-pointer transition-colors ${
                      isPublished
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isPublished ? 'public' : 'visibility_off'}
                    </span>
                    <span>{isPublished ? 'Đã xuất bản' : 'Bản nháp (Chỉ GV xem)'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {lessonTitle}
              </h1>
              {!isPublished && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                  Bản nháp
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isEditorMode && (
            <button
              type="button"
              onClick={onFlushSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border-none cursor-pointer ${
                saveStatus === 'SAVING'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : saveStatus === 'ERROR'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  saveStatus === 'SAVING'
                    ? 'bg-amber-500 animate-ping'
                    : saveStatus === 'ERROR'
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                }`}
              />
              <span>
                {saveStatus === 'SAVING'
                  ? 'Đang tự động lưu...'
                  : saveStatus === 'ERROR'
                    ? 'Lỗi lưu (Bấm thử lại)'
                    : 'Đã đồng bộ'}
              </span>
            </button>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={onToggleEditorMode}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                isEditorMode
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isEditorMode ? 'visibility' : 'edit_note'}
              </span>
              <span>{isEditorMode ? 'Xem như Sinh viên' : 'Chế độ Biên soạn'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick TOC Jump Strip */}
      {tocHeadings.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1">
            Mục lục:
          </span>
          {tocHeadings.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => {
                document
                  .getElementById(`block-${h.id}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              {h.text}
            </button>
          ))}
        </div>
      )}

      {/* Blocks Stack or Empty/Legacy State */}
      {blocks.length === 0 ? (
        <div className="space-y-4">
          {legacyContent && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <MarkdownContent content={legacyContent} />
            </div>
          )}

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">
                view_agenda
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {canEdit
                ? 'Bài học chưa có khối nội dung nào'
                : 'Nội dung bài học đang được giảng viên cập nhật'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {canEdit
                ? 'Bắt đầu xây dựng bài giảng dạng khối (Văn bản, Video, Slide, Code Sandbox, Trắc nghiệm...) ngay bên dưới.'
                : 'Vui lòng quay lại sau hoặc hỏi Cú AI Socratic ở góc phải dưới về chủ đề bài học này.'}
            </p>
            {canEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left max-w-2xl mx-auto">
                {[
                  {
                    id: 'blank',
                    title: 'Trang trắng tự do',
                    desc: 'Tạo khối văn bản đầu tiên, gõ / để chèn mọi loại khối.',
                    icon: 'article',
                    blocks: ['TEXT'] as LessonBlockType[],
                  },
                  {
                    id: 'video',
                    title: 'Video + Ghi chú + Quiz',
                    desc: '4 khối: Tiêu đề, Video bài giảng, Tóm tắt và Quiz nhanh.',
                    icon: 'smart_display',
                    blocks: ['HEADING', 'VIDEO', 'TEXT', 'QUIZ'] as LessonBlockType[],
                  },
                  {
                    id: 'code',
                    title: 'Lý thuyết + Sơ đồ + Code Lab',
                    desc: '5 khối: Tiêu đề, Markdown/KaTeX, Mermaid, Code Sandbox, Callout.',
                    icon: 'code_blocks',
                    blocks: ['HEADING', 'TEXT', 'DIAGRAM', 'CODE_SANDBOX', 'CALLOUT'] as LessonBlockType[],
                  },
                  {
                    id: 'slide',
                    title: 'Slide PDF + Callout + Quiz',
                    desc: '4 khối: Tiêu đề, Slide trình chiếu, Ghi chú trọng tâm, Quiz.',
                    icon: 'co_present',
                    blocks: ['HEADING', 'SLIDE', 'CALLOUT', 'QUIZ'] as LessonBlockType[],
                  },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    disabled={isApplyingTemplate}
                    onClick={() => {
                      if (!isEditorMode) onToggleEditorMode();
                      if (onApplyTemplate) {
                        onApplyTemplate(tpl.blocks);
                      } else {
                        onAddBlock(tpl.blocks[0], null);
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all cursor-pointer flex items-start gap-3 disabled:opacity-50"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[19px]">
                        {tpl.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {tpl.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {tpl.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((block, idx) => (
            <BlockWrapper
              key={block.id}
              block={block}
              index={idx}
              totalBlocks={blocks.length}
              isEditorMode={isEditorMode}
              isDragging={draggedId === block.id}
              isDragOver={dragOverId === block.id}
              onDragStart={() => setDraggedId(block.id)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverId !== block.id) setDragOverId(block.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOn(block.id);
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              onMoveUp={() => idx > 0 && onReorderBlock(block.id, idx - 1)}
              onMoveDown={() =>
                idx < blocks.length - 1 && onReorderBlock(block.id, idx + 1)
              }
              onInsertAfter={(type) => onAddBlock(type, block.id)}
              onDelete={() => onDeleteBlock(block.id)}
              onAskAi={() => {
                askOwlAboutBlock(extractBlockSocraticContext(block));
                onToast('Đã nạp nội dung khối vào Cú AI Socratic!');
              }}
            >
              {renderBlockBody(block, idx)}
            </BlockWrapper>
          ))}
        </div>
      )}

      {/* Editor Bottom Quick-Insert Trigger */}
      {isEditorMode && (
        <div className="relative pt-2">
          <button
            type="button"
            onClick={() => setIsBottomMenuOpen((p) => !p)}
            className="w-full py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-transparent"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Thêm khối nội dung mới (hoặc gõ / trong khối văn bản)</span>
          </button>

          {isBottomMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsBottomMenuOpen(false)}
              />
              <div className="mt-2 flex justify-center relative z-50">
                <SlashCommandMenu
                  isOpen={isBottomMenuOpen}
                  onClose={() => setIsBottomMenuOpen(false)}
                  onSelect={(type) => {
                    setIsBottomMenuOpen(false);
                    onAddBlock(type, blocks[blocks.length - 1]?.id ?? null);
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
