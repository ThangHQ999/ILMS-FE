'use client';

import React, { useState, useEffect } from 'react';
import { CustomSelect } from '@/components/shared';
import type { KnowledgeCategory, KnowledgeNodeData, KnowledgeStatus } from '../../types';

interface QuickAddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nodeData: Partial<KnowledgeNodeData>) => void;
  initialNode?: KnowledgeNodeData | null;
  initialPosition?: { x: number; y: number } | null;
}

const CATEGORY_OPTIONS = [
  { value: 'ds', label: 'Cấu trúc dữ liệu (Data Structures)' },
  { value: 'algo', label: 'Thuật toán & Kỹ thuật (Algorithms)' },
  { value: 'math', label: 'Toán học & Nền tảng (Foundations)' },
  { value: 'icpc', label: 'Bài tập nâng cao & Ứng dụng (ICPC)' },
  { value: 'plo', label: 'Chuẩn đầu ra môn học (PLO/CLO)' },
];

const STATUS_OPTIONS = [
  { value: 'mastered', label: 'Đã thông thạo (Mastered)' },
  { value: 'learning', label: 'Đang học / Khái niệm cốt lõi (Core)' },
  { value: 'prerequisite', label: 'Kiến thức nền tảng / Tiên quyết (Prerequisite)' },
  { value: 'locked', label: 'Khái niệm chuyên sâu (Advanced)' },
];

export function QuickAddNodeModal({
  isOpen,
  onClose,
  onSubmit,
  initialNode = null,
  initialPosition = null,
}: QuickAddNodeModalProps) {
  const isEditing = Boolean(initialNode);

  const [label, setLabel] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<Exclude<KnowledgeCategory, 'all'>>('ds');
  const [status, setStatus] = useState<KnowledgeStatus>('learning');
  const [definition, setDefinition] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('O(1)');
  const [spaceComplexity, setSpaceComplexity] = useState('O(1)');

  useEffect(() => {
    if (initialNode) {
      setLabel(initialNode.label || '');
      setTopic(initialNode.topic || '');
      setCategory(initialNode.category || 'ds');
      setStatus(initialNode.status || 'learning');
      setDefinition(initialNode.definitionText || initialNode.description || '');
      setTimeComplexity(initialNode.complexity?.time || 'O(1)');
      setSpaceComplexity(initialNode.complexity?.space || 'O(1)');
    } else {
      setLabel('');
      setTopic('');
      setCategory('ds');
      setStatus('learning');
      setDefinition('');
      setTimeComplexity('O(1)');
      setSpaceComplexity('O(1)');
    }
  }, [initialNode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const data: Partial<KnowledgeNodeData> = {
      label: label.trim(),
      topic: topic.trim() || 'Chủ đề chung',
      category,
      status,
      description: definition.trim(),
      definitionText: definition.trim(),
      complexity: {
        time: timeComplexity.trim() || 'O(1)',
        space: spaceComplexity.trim() || 'O(1)',
      },
      icon: category === 'ds' ? 'account_tree' : category === 'algo' ? 'polyline' : 'psychology',
    };

    if (!isEditing) {
      const generatedId = `node-custom-${Date.now()}`;
      data.id = generatedId;
      data.masteryScore = status === 'mastered' ? 100 : status === 'learning' ? 65 : 20;
      data.prerequisites = [];
      data.successors = [];
      data.isCenterpiece = false;
      if (initialPosition) {
        data.x = initialPosition.x;
        data.y = initialPosition.y;
      }
    }

    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">
                {isEditing ? 'edit_note' : 'add_circle'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Chỉnh sửa Khái niệm Tri thức' : 'Thêm Node Tri thức Mới'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8E918F]">
                {isEditing
                  ? 'Cập nhật trực tiếp thông tin khái niệm vào bản nháp đồ thị'
                  : 'Tạo nhanh một thực thể kiến thức trực tiếp trên Canvas'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#E3E3E3] mb-1.5">
              Tên khái niệm / Thực thể tri thức <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ví dụ: Cây đỏ đen (Red-Black Tree), Tìm kiếm nhị phân..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#E3E3E3] mb-1.5">
                Phân loại tri thức
              </label>
              <CustomSelect
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(val) => setCategory(val as Exclude<KnowledgeCategory, 'all'>)}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#E3E3E3] mb-1.5">
                Mức độ / Trạng thái
              </label>
              <CustomSelect
                options={STATUS_OPTIONS}
                value={status}
                onChange={(val) => setStatus(val as KnowledgeStatus)}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#E3E3E3] mb-1.5">
              Chủ đề lớn (Topic)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Cấu trúc dữ liệu cây, Kỹ thuật chia để trị..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#E3E3E3] mb-1.5">
              Định nghĩa &amp; Bản chất sư phạm
            </label>
            <textarea
              rows={3}
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Giải thích ngắn gọn bản chất của khái niệm này để sinh viên và AI Tutor tra cứu..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Độ phức tạp thời gian
              </label>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder="O(1), O(log N)..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Độ phức tạp không gian
              </label>
              <input
                type="text"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                placeholder="O(1), O(N)..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
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
              disabled={!label.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer border-none shadow-md"
            >
              {isEditing ? 'Lưu cập nhật' : 'Thêm vào Đồ thị'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
