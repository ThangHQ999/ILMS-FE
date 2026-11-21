'use client';

import React from 'react';
import { MermaidRenderer } from '@/components/shared/MermaidRenderer';
import { Vis3dRenderer } from '@/components/shared/Vis3dRenderer';

interface DiagramBlockProps {
  content: Record<string, unknown>;
  isEditorMode: boolean;
  onChange: (nextContent: Record<string, unknown>) => void;
}

export function DiagramBlock({
  content,
  isEditorMode,
  onChange,
}: DiagramBlockProps) {
  const engine = String(content.engine || 'MERMAID') as 'MERMAID' | 'VIS3D';
  const code = String(content.code ?? '');
  const caption = String(content.caption ?? '');

  if (isEditorMode) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
            <span className="material-symbols-outlined text-[18px] text-indigo-600">
              account_tree
            </span>
            <span>Sơ đồ trực quan ({engine})</span>
          </div>
          <div className="flex items-center gap-1">
            {(['MERMAID', 'VIS3D'] as const).map((eng) => (
              <button
                key={eng}
                type="button"
                onClick={() => onChange({ ...content, engine: eng })}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border-none cursor-pointer ${
                  engine === eng
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {eng}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          value={caption}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Tiêu đề / Chú thích sơ đồ..."
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border-none outline-none"
        />

        <textarea
          value={code}
          onChange={(e) => onChange({ ...content, code: e.target.value })}
          rows={5}
          spellCheck={false}
          placeholder="Nhập mã Mermaid (flowchart, sequenceDiagram...) hoặc JSON Vis3D..."
          className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 outline-none border-none resize-y"
        />

        {code.trim() && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3 border border-slate-200/60 dark:border-slate-800">
            {engine === 'VIS3D' ? (
              <Vis3dRenderer rawCode={code} />
            ) : (
              <MermaidRenderer code={code} />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs">
      {caption && (
        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {caption}
        </div>
      )}
      {engine === 'VIS3D' ? (
        <Vis3dRenderer rawCode={code} />
      ) : (
        <MermaidRenderer code={code} />
      )}
    </div>
  );
}
