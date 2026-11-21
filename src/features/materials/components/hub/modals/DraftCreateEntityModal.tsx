'use client';

import React, { useState } from 'react';
import { CustomSelect } from '@/components/shared';
import type { DraftTopic } from '../../../utils/draft-graph-crud';

interface DraftCreateEntityModalProps {
  isOpen: boolean;
  topics?: DraftTopic[];
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    description: string;
    definition: string;
    topicName?: string;
  }) => void;
}

export function DraftCreateEntityModal({
  isOpen,
  topics = [],
  onClose,
  onSubmit,
}: DraftCreateEntityModalProps) {
  const [name, setName] = useState('');
  const [definition, setDefinition] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên thực thể tri thức');
      return;
    }
    onSubmit({
      name: trimmed,
      definition: definition.trim(),
      description: description.trim(),
      topicName: selectedTopic || undefined,
    });
    setName('');
    setDefinition('');
    setDescription('');
    setSelectedTopic('');
    setError('');
    onClose();
  };

  const topicOptions = [
    { value: '', label: '-- Không gán chủ đề (Mặc định) --' },
    ...topics.map((t) => ({ value: t.name, label: t.name })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center material-symbols-outlined text-[20px]">
              add_circle
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Thêm Thực thể Tri thức Mới
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên thực thể / Khái niệm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="VD: Thuật toán mã hóa RSA, Giao thức TCP/IP..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Định nghĩa cốt lõi (Definition)
            </label>
            <textarea
              rows={3}
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Giải thích ngắn gọn, súc tích bản chất của khái niệm này..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mô tả chi tiết / Bối cảnh áp dụng
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú thêm về vai trò và ngữ cảnh xuất hiện..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {topics.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Gán vào Chủ đề (Topic)
              </label>
              <CustomSelect<string>
                value={selectedTopic}
                onChange={(val) => setSelectedTopic(val)}
                options={topicOptions}
              />
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
              className="px-4 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Tạo thực thể</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
