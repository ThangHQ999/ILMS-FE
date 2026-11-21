'use client';

import React, { useMemo, useState } from 'react';

interface SlideBlockProps {
  content: Record<string, unknown>;
  isEditorMode: boolean;
  onChange: (nextContent: Record<string, unknown>) => void;
}

export function SlideBlock({
  content,
  isEditorMode,
  onChange,
}: SlideBlockProps) {
  const url = String(content.url ?? '');
  const materialId = content.materialId ? String(content.materialId) : null;
  const fileName = String(content.fileName ?? '');
  const embedType = String(content.embedType || 'PDF') as
    | 'PDF'
    | 'GOOGLE_SLIDES';
  const [isExpanded, setIsExpanded] = useState(false);

  const safeExternalUrl = /^https?:\/\//i.test(url) ? url : '';
  const viewerSrc = useMemo(() => {
    if (safeExternalUrl) {
      const driveMatch = safeExternalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch?.[1]) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      }
      return safeExternalUrl;
    }
    if (materialId) {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      return `${base}/materials/${materialId}/download`;
    }
    return '';
  }, [safeExternalUrl, materialId]);

  if (isEditorMode) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
            <span className="material-symbols-outlined text-[18px] text-amber-600">
              co_present
            </span>
            <span>Khối Slide / Tài liệu PDF</span>
          </div>
          <div className="flex items-center gap-1">
            {(['PDF', 'GOOGLE_SLIDES'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ ...content, embedType: t })}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border-none cursor-pointer ${
                  embedType === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => onChange({ ...content, url: e.target.value })}
            placeholder="Dán link PDF hoặc Google Slides (https://...)..."
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border-none outline-none"
          />
          <input
            type="text"
            value={fileName}
            onChange={(e) => onChange({ ...content, fileName: e.target.value })}
            placeholder="Tên hiển thị tài liệu / slide..."
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border-none outline-none"
          />
        </div>
      </div>
    );
  }

  if (!viewerSrc) {
    return (
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500">
        Chưa gắn liên kết slide hoặc tài liệu PDF cho khối này.
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">
            co_present
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {fileName || 'Tài liệu trình chiếu'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded((p) => !p)}
            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border-none cursor-pointer"
          >
            {isExpanded ? 'Thu gọn' : 'Mở rộng'}
          </button>
          <a
            href={viewerSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[11px] font-semibold text-blue-600 dark:text-blue-400"
          >
            Mở tab mới
          </a>
        </div>
      </div>

      <iframe
        src={viewerSrc}
        title={fileName || 'Slide Viewer'}
        className={`w-full border-0 bg-slate-100 dark:bg-slate-950 transition-all ${
          isExpanded ? 'h-[700px]' : 'h-[440px]'
        }`}
      />
    </div>
  );
}
