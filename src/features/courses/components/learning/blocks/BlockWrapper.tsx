'use client';

import React, { useState } from 'react';
import type { LessonBlock, LessonBlockType } from '../../../schemas/lesson-block.schema';
import { SlashCommandMenu } from './SlashCommandMenu';

interface BlockWrapperProps {
  block: LessonBlock;
  index: number;
  totalBlocks: number;
  isEditorMode: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInsertAfter: (type: LessonBlockType) => void;
  onDelete: () => void;
  onAskAi: () => void;
  children: React.ReactNode;
}

export function BlockWrapper({
  block,
  index,
  totalBlocks,
  isEditorMode,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onInsertAfter,
  onDelete,
  onAskAi,
  children,
}: BlockWrapperProps) {
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  return (
    <div
      id={`block-${block.id}`}
      draggable={isEditorMode}
      onDragStart={isEditorMode ? onDragStart : undefined}
      onDragOver={isEditorMode ? onDragOver : undefined}
      onDrop={isEditorMode ? onDrop : undefined}
      onDragEnd={isEditorMode ? onDragEnd : undefined}
      className={`group relative rounded-2xl transition-all ${
        isDragOver
          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950'
          : ''
      } ${isDragging ? 'opacity-45' : ''} ${
        isEditorMode
          ? 'pl-10 pr-3 py-2 hover:bg-white/70 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800'
          : 'py-1'
      }`}
    >
      {/* Editor Mode Left Gutter */}
      {isEditorMode && (
        <div className="absolute left-1 top-2.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-20">
          <button
            type="button"
            onClick={() => setIsInsertMenuOpen((prev) => !prev)}
            title="Chèn khối mới bên dưới"
            className="w-6 h-6 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-center border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOptionsOpen((prev) => !prev)}
            title="Kéo thả để sắp xếp hoặc mở tùy chọn khối"
            className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center border-none bg-transparent cursor-grab active:cursor-grabbing"
          >
            <span className="material-symbols-outlined text-[16px]">
              drag_indicator
            </span>
          </button>

          {isOptionsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsOptionsOpen(false)}
              />
              <div className="absolute left-0 top-8 z-40 w-44 rounded-xl bg-white dark:bg-[#1E1F20] shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onMoveUp();
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  <span>Di chuyển lên</span>
                </button>
                <button
                  type="button"
                  disabled={index === totalBlocks - 1}
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onMoveDown();
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  <span>Di chuyển xuống</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onDelete();
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Xóa khối này</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Viewer Mode "Hỏi Cú AI" floating action */}
      {!isEditorMode && block.type !== 'DIVIDER' && (
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-20">
          <button
            type="button"
            onClick={onAskAi}
            title="Nạp nội dung khối này vào Cú AI Socratic"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-blue-50 dark:hover:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/70 shadow-sm text-[11px] font-bold cursor-pointer backdrop-blur-xs"
          >
            <span className="material-symbols-outlined text-[14px]">psychology</span>
            <span>Hỏi Cú AI</span>
          </button>
        </div>
      )}

      {/* Block Main Body */}
      <div className="min-w-0">{children}</div>

      {/* Inline Slash Insert Menu */}
      {isInsertMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsInsertMenuOpen(false)}
          />
          <div className="mt-2 relative z-50">
            <SlashCommandMenu
              isOpen={isInsertMenuOpen}
              onClose={() => setIsInsertMenuOpen(false)}
              onSelect={(type) => {
                setIsInsertMenuOpen(false);
                onInsertAfter(type);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
