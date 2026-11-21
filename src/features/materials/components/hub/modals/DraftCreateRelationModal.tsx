'use client';

import React, { useState } from 'react';
import { CustomSelect } from '@/components/shared';
import {
  RELATION_TYPES,
  type DraftEntity,
  type RelationType,
} from '../../../utils/draft-graph-crud';

interface DraftCreateRelationModalProps {
  isOpen: boolean;
  entities?: DraftEntity[];
  initialSource?: string;
  onClose: () => void;
  onSubmit: (payload: {
    source: string;
    target: string;
    relation_type: string;
  }) => void;
}

const RELATION_TYPE_LABELS: Record<RelationType, { label: string; desc: string }> = {
  REQUIRES: { label: 'REQUIRES (Yêu cầu tiên quyết)', desc: 'Khái niệm nguồn đòi hỏi phải hiểu khái niệm đích trước.' },
  DEPENDS_ON: { label: 'DEPENDS_ON (Phụ thuộc vào)', desc: 'Hoạt động hoặc kết quả dựa trên khái niệm đích.' },
  IS_A: { label: 'IS_A (Là một thể loại của)', desc: 'Khái niệm nguồn là trường hợp đặc biệt / kế thừa từ đích.' },
  PART_OF: { label: 'PART_OF (Là một phần của)', desc: 'Khái niệm nguồn cấu thành nên cấu trúc của đích.' },
  CONTRASTS_WITH: { label: 'CONTRASTS_WITH (Đối chiếu / Khác biệt)', desc: 'Hai khái niệm phân biệt rõ rệt hoặc đối nghịch nhau.' },
  USES: { label: 'USES (Sử dụng / Ứng dụng)', desc: 'Khái niệm nguồn áp dụng hoặc thực thi qua khái niệm đích.' },
  APPLIES_TO: { label: 'APPLIES_TO (Áp dụng cho)', desc: 'Phạm vi hoặc đối tượng mà khái niệm tác động tới.' },
};

export function DraftCreateRelationModal({
  isOpen,
  entities = [],
  initialSource = '',
  onClose,
  onSubmit,
}: DraftCreateRelationModalProps) {
  const [source, setSource] = useState(initialSource);
  const [target, setTarget] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('REQUIRES');
  const [error, setError] = useState('');

  // Update initialSource if passed
  React.useEffect(() => {
    if (initialSource) setSource(initialSource);
  }, [initialSource]);

  if (!isOpen) return null;

  const entityOptions = entities.map((e) => ({
    value: e.name,
    label: e.name,
  }));

  const relationOptions = RELATION_TYPES.map((type) => ({
    value: type,
    label: RELATION_TYPE_LABELS[type]?.label || type,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source) {
      setError('Vui lòng chọn Thực thể nguồn');
      return;
    }
    if (!target) {
      setError('Vui lòng chọn Thực thể đích');
      return;
    }
    if (source.toLowerCase() === target.toLowerCase()) {
      setError('Thực thể nguồn và thực thể đích không được trùng nhau');
      return;
    }
    onSubmit({
      source,
      target,
      relation_type: relationType,
    });
    setTarget('');
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
            <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center material-symbols-outlined text-[20px]">
              account_tree
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Nối Quan hệ Tri thức Mới
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
              Thực thể nguồn (Source Concept) <span className="text-rose-500">*</span>
            </label>
            <CustomSelect<string>
              value={source}
              onChange={(val) => {
                setSource(val);
                if (error) setError('');
              }}
              options={[
                { value: '', label: '-- Chọn thực thể xuất phát --' },
                ...entityOptions,
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Loại quan hệ liên kết (Relation Type) <span className="text-rose-500">*</span>
            </label>
            <CustomSelect<RelationType>
              value={relationType}
              onChange={(val) => setRelationType(val)}
              options={relationOptions}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
              {RELATION_TYPE_LABELS[relationType]?.desc}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Thực thể đích (Target Concept) <span className="text-rose-500">*</span>
            </label>
            <CustomSelect<string>
              value={target}
              onChange={(val) => {
                setTarget(val);
                if (error) setError('');
              }}
              options={[
                { value: '', label: '-- Chọn thực thể đích đến --' },
                ...entityOptions,
              ]}
            />
          </div>

          {source && target && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
              <span className="font-bold text-blue-600 dark:text-blue-400">{source}</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                ──[{relationType}]──►
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{target}</span>
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>Tạo quan hệ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
