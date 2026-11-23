'use client';

import React, { useState } from 'react';
import { CustomSelect } from '@/components/shared';
import type { KnowledgeNodeData } from '../../types';

interface QuickConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (relationType: string, label: string) => void;
  sourceNode: KnowledgeNodeData | null;
  targetNode: KnowledgeNodeData | null;
}

const RELATION_OPTIONS = [
  { value: 'PREREQUISITE', label: 'Tiên quyết (Source là tiền đề cần học trước Target)' },
  { value: 'REQUIRES', label: 'Yêu cầu (Target yêu cầu hiểu sâu Source)' },
  { value: 'DEPENDS_ON', label: 'Phụ thuộc (Phụ thuộc cấu trúc logic)' },
  { value: 'RELATED_TO', label: 'Liên quan mật thiết (Related concept)' },
  { value: 'PART_OF', label: 'Thuộc phần / Cấu thành (Part-of component)' },
  { value: 'USES', label: 'Ứng dụng / Sử dụng (Uses in practice)' },
  { value: 'CONTRASTS_WITH', label: 'Đối chiếu / So sánh (Contrasts with)' },
];

export function QuickConnectModal({
  isOpen,
  onClose,
  onSubmit,
  sourceNode,
  targetNode,
}: QuickConnectModalProps) {
  const [relationType, setRelationType] = useState('PREREQUISITE');

  if (!isOpen || !sourceNode || !targetNode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opt = RELATION_OPTIONS.find((o) => o.value === relationType);
    const friendlyLabel =
      relationType === 'PREREQUISITE'
        ? 'Tiên quyết'
        : relationType === 'REQUIRES'
        ? 'Yêu cầu'
        : relationType === 'DEPENDS_ON'
        ? 'Phụ thuộc'
        : relationType === 'PART_OF'
        ? 'Thuộc phần'
        : relationType === 'USES'
        ? 'Sử dụng'
        : relationType === 'CONTRASTS_WITH'
        ? 'Đối chiếu'
        : 'Liên kết';

    onSubmit(relationType, friendlyLabel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">polyline</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Nối Quan Hệ Tri Thức
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8E918F]">
                Thiết lập liên kết logic giữa 2 khái niệm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Visual Link Node A -> Node B */}
        <div className="p-3.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-between gap-3 text-xs">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Nguồn (Source)</span>
            <span className="font-bold text-slate-900 dark:text-white truncate block" title={sourceNode.label}>
              {sourceNode.label}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1E1F20] flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Đích (Target)</span>
            <span className="font-bold text-slate-900 dark:text-white truncate block" title={targetNode.label}>
              {targetNode.label}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#E3E3E3] mb-1.5">
              Loại quan hệ liên kết
            </label>
            <CustomSelect
              options={RELATION_OPTIONS}
              value={relationType}
              onChange={(val) => setRelationType(val)}
              className="w-full text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer border-none shadow-md"
            >
              Tạo Quan Hệ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
