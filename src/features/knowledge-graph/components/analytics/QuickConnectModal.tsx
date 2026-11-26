'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  STANDARD_RELATIONS,
  getRelationDisplayLabel,
  type KnowledgeNodeData,
} from '../../types';

interface QuickConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (relationType: string, label: string) => void;
  sourceNode: KnowledgeNodeData | null;
  targetNode: KnowledgeNodeData | null;
}

type CategoryFilter = 'all' | 'hierarchy' | 'composition' | 'dependency' | 'association' | 'causality' | 'origin';

const PAGE_SIZE = 8; // 2 cột x 4 hàng

export function QuickConnectModal({
  isOpen,
  onClose,
  onSubmit,
  sourceNode,
  targetNode,
}: QuickConnectModalProps) {
  const [selectedRelation, setSelectedRelation] = useState<string>('REQUIRES');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customRelationInput, setCustomRelationInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedRelation('REQUIRES');
      setActiveCategory('all');
      setSearchQuery('');
      setCurrentPage(1);
      setIsCustomMode(false);
      setCustomRelationInput('');
    }
  }, [isOpen]);

  const filteredRelations = useMemo(() => {
    return STANDARD_RELATIONS.filter((r) => {
      const matchCat = activeCategory === 'all' || r.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.value.toLowerCase().includes(q) ||
        r.label.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.categoryLabel.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRelations.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRelations = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredRelations.slice(start, start + PAGE_SIZE);
  }, [filteredRelations, safeCurrentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (!isOpen || !sourceNode || !targetNode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalType = selectedRelation;
    if (isCustomMode && customRelationInput.trim()) {
      finalType = customRelationInput.trim().toUpperCase().replace(/\s+/g, '_');
    }
    const friendlyLabel = getRelationDisplayLabel(finalType);
    onSubmit(finalType, friendlyLabel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-white/10 shadow-2xl p-5 space-y-3.5 animate-scale-in text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">polyline</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#E3E3E3]">
                Thiết Lập Quan Hệ Tri Thức
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                Chọn liên kết logic giữa 2 khái niệm hoặc tạo quan hệ tùy biến
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Visual Link: Node A -> Node B */}
        <div className="p-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">
              Nguồn (Source)
            </span>
            <span className="font-bold text-slate-900 dark:text-[#E3E3E3] truncate block text-[11px]" title={sourceNode.label}>
              {sourceNode.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs shrink-0 font-medium text-[11px]">
            <span>{isCustomMode && customRelationInput.trim() ? customRelationInput.trim() : getRelationDisplayLabel(selectedRelation)}</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">
              Đích (Target)
            </span>
            <span className="font-bold text-slate-900 dark:text-[#E3E3E3] truncate block text-[11px]" title={targetNode.label}>
              {targetNode.label}
            </span>
          </div>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="space-y-2 shrink-0">
          {/* Search Input */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[17px] text-slate-400 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm loại quan hệ (VD: IS_A, REQUIRES, nguyên nhân, bao hàm...)"
              className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs bg-[#F0F4F9] dark:bg-[#282A2C] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-[#E3E3E3] outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA] font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Horizontal Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả (22)' },
              { id: 'dependency', label: 'Tiên quyết' },
              { id: 'hierarchy', label: 'Phân loại' },
              { id: 'composition', label: 'Bao hàm' },
              { id: 'association', label: 'Liên kết' },
              { id: 'causality', label: 'Hệ quả' },
              { id: 'origin', label: 'Nguồn gốc' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategory(tab.id as CategoryFilter);
                  setCurrentPage(1);
                  setIsCustomMode(false);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer border-none ${
                  activeCategory === tab.id && !isCustomMode
                    ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-bold'
                    : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-600 dark:text-[#C4C7C5] hover:bg-slate-200 dark:hover:bg-[#333537]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body with Pagination */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden space-y-3">
          {!isCustomMode ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                <span className="font-bold text-slate-700 dark:text-[#E3E3E3]">
                  Chọn loại quan hệ ({filteredRelations.length}):
                </span>
                {totalPages > 1 && (
                  <span className="font-mono text-[10px]">
                    Trang {safeCurrentPage} / {totalPages}
                  </span>
                )}
              </div>

              {paginatedRelations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-50 dark:bg-[#282A2C]/40 border border-dashed border-slate-200 dark:border-white/10">
                  Không tìm thấy loại quan hệ nào khớp với &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {paginatedRelations.map((rel) => {
                    const isSelected = selectedRelation === rel.value;
                    return (
                      <button
                        key={rel.value}
                        type="button"
                        onClick={() => setSelectedRelation(rel.value)}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D3E3FD]/30 dark:bg-[#162B4D]/40 border-[#0B57D0] dark:border-[#A8C7FA] ring-1 ring-[#0B57D0] dark:ring-[#A8C7FA]'
                            : 'bg-white dark:bg-[#1E1F20] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F]'
                                : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-500 dark:text-[#C4C7C5]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">{rel.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-slate-900 dark:text-[#E3E3E3] truncate block">
                              {rel.value}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-[#C4C7C5] truncate block">
                              {rel.description}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#282A2C] text-slate-500 dark:text-[#C4C7C5] shrink-0 font-medium">
                          {rel.categoryLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Hiển thị {(safeCurrentPage - 1) * PAGE_SIZE + 1} -{' '}
                    {Math.min(safeCurrentPage * PAGE_SIZE, filteredRelations.length)} / {filteredRelations.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#282A2C] cursor-pointer"
                    >
                      ‹ Trước
                    </button>
                    <span className="text-[10px] font-mono font-bold px-1 text-slate-700 dark:text-[#E3E3E3]">
                      {safeCurrentPage}/{totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#282A2C] cursor-pointer"
                    >
                      Sau ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/60 border border-slate-200/80 dark:border-white/10 animate-fade-in">
              <label className="text-xs font-bold text-slate-700 dark:text-[#E3E3E3]">
                Nhập mã loại quan hệ tùy biến:
              </label>
              <input
                type="text"
                value={customRelationInput}
                onChange={(e) => setCustomRelationInput(e.target.value)}
                placeholder="Ví dụ: INHERITS_FROM, TRANSLATES_TO, OPTIMIZES_FOR..."
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-white/10 text-xs font-mono font-medium text-slate-900 dark:text-[#E3E3E3] outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                Tự động chuẩn hóa chữ hoa (UPPERCASE) và gạch dưới cho đồ thị.
              </p>
            </div>
          )}

          {/* Custom Relation Toggle */}
          <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#C4C7C5]">
              {isCustomMode ? 'Đang ở chế độ nhập tùy biến' : 'Không tìm thấy loại phù hợp?'}
            </span>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer border-none bg-transparent"
            >
              {isCustomMode ? '← Chọn từ danh sách chuẩn' : '+ Tự tạo quan hệ tùy biến'}
            </button>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isCustomMode && !customRelationInput.trim()}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#0B57D0] dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:bg-[#0842A0] dark:hover:bg-[#8AB4F8] transition-colors cursor-pointer border-none shadow-md disabled:opacity-50"
            >
              Thiết Lập Quan Hệ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
