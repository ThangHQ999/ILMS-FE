'use client';

import React, { useState } from 'react';
import { LatexFormulaPicker, MarkdownContent } from '@/components/shared';
import type { LessonBlockType } from '../../../schemas/lesson-block.schema';

interface BasicBlockProps {
  content: Record<string, unknown>;
  isEditorMode: boolean;
  onChange: (nextContent: Record<string, unknown>) => void;
  onOpenSlashMenu?: (query: string) => void;
}

export function HeadingBlock({
  content,
  isEditorMode,
  onChange,
}: BasicBlockProps) {
  const level = (content.level === 1 || content.level === 2 || content.level === 3
    ? content.level
    : 2) as 1 | 2 | 3;
  const text = String(content.text ?? '');

  const sizeClass =
    level === 1
      ? 'text-2xl sm:text-3xl font-extrabold tracking-tight'
      : level === 2
        ? 'text-xl sm:text-2xl font-bold tracking-tight'
        : 'text-base sm:text-lg font-bold';

  if (!isEditorMode) {
    return (
      <div className="pt-2 pb-1">
        <h2 className={`${sizeClass} text-slate-900 dark:text-slate-100`}>
          {text || 'Tiêu đề'}
        </h2>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 shrink-0">
        {([1, 2, 3] as const).map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => onChange({ ...content, level: lv })}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border-none cursor-pointer transition-colors ${
              level === lv
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            H{lv}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Nhập tiêu đề mục..."
        className={`flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 ${sizeClass}`}
      />
    </div>
  );
}

export function TextBlock({
  content,
  isEditorMode,
  onChange,
  onOpenSlashMenu,
}: BasicBlockProps) {
  const markdown = String(content.markdown ?? '');
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);

  if (!isEditorMode) {
    if (!markdown.trim()) return null;
    return (
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl px-6 py-4 border border-slate-200/70 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
        <MarkdownContent content={markdown} />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 relative">
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[11px] text-slate-400 font-medium">
          Hỗ trợ Markdown &amp; KaTeX ($...$). Gõ <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">/</kbd> ở đầu dòng để chèn khối mới.
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFormulaOpen((p) => !p)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">functions</span>
            <span>LaTeX</span>
          </button>
          <LatexFormulaPicker
            isOpen={isFormulaOpen}
            onClose={() => setIsFormulaOpen(false)}
            onSelectFormula={(formula) => {
              onChange({ ...content, markdown: `${markdown} $${formula}$`.trim() });
              setIsFormulaOpen(false);
            }}
          />
        </div>
      </div>

      <textarea
        value={markdown}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '/' && onOpenSlashMenu) {
            onOpenSlashMenu('');
            return;
          }
          onChange({ ...content, markdown: val });
        }}
        rows={Math.max(3, Math.min(12, markdown.split('\n').length + 1))}
        placeholder="Nhập nội dung bài giảng hoặc gõ / để chèn khối..."
        className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none border-none resize-y leading-relaxed"
      />
    </div>
  );
}

export function CalloutBlock({
  content,
  isEditorMode,
  onChange,
}: BasicBlockProps) {
  const variant = String(content.variant || 'INFO') as
    | 'INFO'
    | 'TIP'
    | 'WARNING'
    | 'THEOREM';
  const title = String(content.title ?? '');
  const markdown = String(content.markdown ?? '');

  const styles: Record<string, { bg: string; icon: string; color: string; label: string }> = {
    INFO: {
      bg: 'bg-blue-50/90 dark:bg-blue-950/35 border-blue-200 dark:border-blue-800/70',
      icon: 'info',
      color: 'text-blue-600 dark:text-blue-400',
      label: 'Thông tin',
    },
    TIP: {
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/70',
      icon: 'lightbulb',
      color: 'text-emerald-600 dark:text-emerald-400',
      label: 'Mẹo ghi nhớ',
    },
    WARNING: {
      bg: 'bg-amber-50/90 dark:bg-amber-950/35 border-amber-200 dark:border-amber-800/70',
      icon: 'warning',
      color: 'text-amber-600 dark:text-amber-400',
      label: 'Lưu ý',
    },
    THEOREM: {
      bg: 'bg-indigo-50/90 dark:bg-indigo-950/35 border-indigo-200 dark:border-indigo-800/70',
      icon: 'functions',
      color: 'text-indigo-600 dark:text-indigo-400',
      label: 'Định lý',
    },
  };

  const s = styles[variant] ?? styles.INFO;

  if (!isEditorMode) {
    return (
      <div className={`rounded-2xl p-4 sm:p-5 border ${s.bg} flex items-start gap-3`}>
        <span className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${s.color}`}>
          {s.icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          {title && (
            <h4 className={`text-sm font-bold ${s.color}`}>{title}</h4>
          )}
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <MarkdownContent content={markdown} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-4 border ${s.bg} space-y-2.5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Tiêu đề callout..."
          className={`flex-1 bg-transparent border-none outline-none text-sm font-bold ${s.color}`}
        />
        <div className="flex items-center gap-1">
          {(['INFO', 'TIP', 'WARNING', 'THEOREM'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ ...content, variant: v })}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-none cursor-pointer ${
                variant === v
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              {styles[v].label}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={markdown}
        onChange={(e) => onChange({ ...content, markdown: e.target.value })}
        rows={2}
        placeholder="Nội dung callout (hỗ trợ Markdown & LaTeX)..."
        className="w-full bg-white/70 dark:bg-slate-900/60 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none border border-slate-200/70 dark:border-slate-700/70 resize-y"
      />
    </div>
  );
}

export function ImageBlock({
  content,
  isEditorMode,
  onChange,
}: BasicBlockProps) {
  const url = String(content.url ?? '');
  const caption = String(content.caption ?? '');
  const safeUrl = /^https?:\/\//i.test(url) ? url : '';

  if (!isEditorMode) {
    if (!safeUrl) return null;
    return (
      <figure className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <img src={safeUrl} alt={caption || 'Lesson illustration'} className="w-full max-h-[520px] object-contain bg-slate-100 dark:bg-slate-950" />
        {caption && (
          <figcaption className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="Dán URL hình ảnh (https://...)..."
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border-none outline-none"
        />
        <input
          type="text"
          value={caption}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Chú thích ảnh..."
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border-none outline-none"
        />
      </div>
      {safeUrl && (
        <img
          src={safeUrl}
          alt={caption || 'Preview'}
          className="w-full max-h-64 object-contain rounded-xl bg-slate-50 dark:bg-slate-950"
        />
      )}
    </div>
  );
}

export function DividerBlock() {
  return <hr className="my-3 border-t border-slate-200 dark:border-slate-800" />;
}
