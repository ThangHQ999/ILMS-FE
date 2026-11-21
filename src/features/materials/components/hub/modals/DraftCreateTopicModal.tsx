'use client';

import React, { useState } from 'react';
import type { DraftEntity } from '../../../utils/draft-graph-crud';

interface DraftCreateTopicModalProps {
  isOpen: boolean;
  entities?: DraftEntity[];
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    summary: string;
    conceptsIncluded: string[];
  }) => void;
}

export function DraftCreateTopicModal({
  isOpen,
  entities = [],
  onClose,
  onSubmit,
}: DraftCreateTopicModalProps) {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleConcept = (conceptName: string) => {
    setSelectedConcepts((prev) =>
      prev.includes(conceptName)
        ? prev.filter((c) => c !== conceptName)
        : [...prev, conceptName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên chủ đề');
      return;
    }
    onSubmit({
      name: trimmed,
      summary: summary.trim(),
      conceptsIncluded: selectedConcepts,
    });
    setName('');
    setSummary('');
    setSelectedConcepts([]);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center material-symbols-outlined text-[20px]">
              folder_special
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Thêm Chủ đề Gom nhóm (Topic)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên chủ đề <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="VD: Cấu trúc dữ liệu & Thuật toán cơ bản..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tóm tắt tổng quan chủ đề
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Mô tả phạm vi và mục tiêu bao quát của chủ đề này..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {entities.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Chọn các khái niệm thuộc chủ đề ({selectedConcepts.length})
              </label>
              <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5">
                {entities.map((e) => {
                  const isChecked = selectedConcepts.includes(e.name);
                  return (
                    <button
                      key={e.name}
                      type="button"
                      onClick={() => toggleConcept(e.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {e.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Tạo chủ đề</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
