'use client';

import React, { useEffect, useState } from 'react';
import type { NodeFieldInfo } from '../../../utils/draft-graph-crud';

interface DraftNodeEditModalProps {
  isOpen: boolean;
  kind: string;
  label: string;
  path: string;
  fields: NodeFieldInfo[];
  onClose: () => void;
  onSaveField: (field: string, value: string) => void;
  onDelete: () => void;
  onOpenFullEntityEditor?: () => void;
}

export function DraftNodeEditModal({
  isOpen,
  kind,
  label,
  path,
  fields,
  onClose,
  onSaveField,
  onDelete,
  onOpenFullEntityEditor,
}: DraftNodeEditModalProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.key] = f.value;
    });
    setFormValues(initial);
    setError('');
  }, [fields, isOpen]);

  if (!isOpen) return null;

  const isRequiredField = (fKey: string) => {
    if (fKey === 'name') return true;
    if (fKey === 'definition') return true;
    if (fKey === 'content' && (kind === 'Definition' || path.includes('/definition'))) return true;
    return false;
  };

  const hasInvalidRequired = fields.some(
    (f) => isRequiredField(f.key) && !(formValues[f.key] ?? '').trim()
  );

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (isRequiredField(f.key)) {
        const val = (formValues[f.key] ?? '').trim();
        if (!val) {
          setError(`Trường "${f.label}" là bắt buộc, không được để trống.`);
          return;
        }
      }
    }
    setError('');
    Object.entries(formValues).forEach(([key, val]) => {
      onSaveField(key, val);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center material-symbols-outlined text-[20px] shrink-0">
              edit
            </span>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {kind}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{path}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {label}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1 rounded-lg shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveAll} className="space-y-3.5">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {f.label} {isRequiredField(f.key) && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={f.rows || 2}
                required={isRequiredField(f.key)}
                value={formValues[f.key] ?? ''}
                onChange={(e) => {
                  setFormValues((prev) => ({ ...prev, [f.key]: e.target.value }));
                  if (error) setError('');
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          ))}

          {kind === 'KnowledgeEntity' && onOpenFullEntityEditor && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullEntityEditor();
                }}
                className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">hub</span>
                <span>Mở biên tập toàn diện (Quy trình, Bài tập, Ví dụ, Lập luận)</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Bạn có chắc chắn muốn xóa [${kind}] "${label}"?`)) {
                  onDelete();
                  onClose();
                }
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Xóa node</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={hasInvalidRequired}
                className="px-4 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
