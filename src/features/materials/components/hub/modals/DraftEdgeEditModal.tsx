'use client';

import React, { useState, useEffect } from 'react';

interface DraftEdgeEditModalProps {
  isOpen: boolean;
  edgeId: string;
  sourceLabel: string;
  targetLabel: string;
  relationType: string;
  isCustomRelation: boolean;
  onClose: () => void;
  onUpdateRelationType: (newType: string) => void;
  onDeleteEdge: () => void;
}

const COMMON_RELATIONS = [
  'IS_A',
  'HAS_CATEGORY',
  'HAS_SUBTYPE',
  'CLASSIFIED_INTO',
  'IS_VARIANT_OF',
  'PART_OF',
  'COMPOSED_OF',
  'CONTAINS',
  'REQUIRES',
  'DEPENDS_ON',
  'APPLIES_TO',
  'ASSOCIATED_WITH',
  'USES',
  'CONTRASTS_WITH',
  'IMPROVES_UPON',
  'CAUSES',
  'LEADS_TO',
  'SOLVES',
  'PRODUCES',
  'YIELDS',
  'CREATED_BY',
  'DISCOVERED_BY',
  'RELATES_TO',
  'EXTENDS',
  'INCLUDES',
];

export function DraftEdgeEditModal({
  isOpen,
  edgeId,
  sourceLabel,
  targetLabel,
  relationType,
  isCustomRelation,
  onClose,
  onUpdateRelationType,
  onDeleteEdge,
}: DraftEdgeEditModalProps) {
  const [currentType, setCurrentType] = useState(relationType);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    setCurrentType(relationType);
    setCustomInput('');
  }, [relationType, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = (customInput.trim() || currentType).toUpperCase();
    if (!finalType) return;
    onUpdateRelationType(finalType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Biên tập Dây nối &amp; Liên kết
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[280px]">
                {edgeId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Visual Link Direction Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-0.5">
              Nguồn
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate" title={sourceLabel}>
              {sourceLabel}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 px-1">
            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[20px]">
              arrow_forward
            </span>
            <span className="text-[10px] font-mono font-extrabold text-purple-700 dark:text-purple-300">
              {customInput.trim().toUpperCase() || currentType}
            </span>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-0.5">
              Đích
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate" title={targetLabel}>
              {targetLabel}
            </p>
          </div>
        </div>

        {isCustomRelation ? (
          <form onSubmit={handleSave} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Đổi loại quan hệ sư phạm:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_RELATIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setCurrentType(r);
                      setCustomInput('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      !customInput && currentType === r
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Hoặc nhập loại quan hệ mới:
              </label>
              <input
                type="text"
                placeholder="VD: COVERS, LEADS_TO, DEPENDS_ON..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase font-mono outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Bạn có chắc chắn muốn xóa liên kết [${relationType}] giữa "${sourceLabel}" và "${targetLabel}"?`
                    )
                  ) {
                    onDeleteEdge();
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
                <span>Xóa liên kết này</span>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs">
              💡 Đây là <strong>liên kết cấu trúc cha - con</strong> tự động (như Thực thể ➔ Định nghĩa / Quy trình / Bài tập / Ví dụ). Để ngắt hoặc xóa liên kết này, bạn có thể xóa hoặc sửa trực tiếp node con tương ứng.
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Xác nhận xóa liên kết hoặc gỡ bỏ liên hệ giữa "${sourceLabel}" và "${targetLabel}"?`
                    )
                  ) {
                    onDeleteEdge();
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">link_off</span>
                <span>Gỡ bỏ liên kết này</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
