'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface DraftQuickConnectModalProps {
  isOpen: boolean;
  sourceLabel: string;
  targetLabel: string;
  sourceKind?: string;
  targetKind?: string;
  onClose: () => void;
  onSubmit: (relationType: string) => void;
}

interface RelationItem {
  value: string;
  label: string;
  desc: string;
  category: 'hierarchy' | 'composition' | 'dependency' | 'association' | 'causality' | 'origin' | 'pedagogical';
  categoryLabel: string;
}

const COMMON_RELATIONS: RelationItem[] = [
  // 1. Phân loại & Thứ bậc
  { value: 'IS_A', label: 'IS_A', desc: 'Là một thể loại của', category: 'hierarchy', categoryLabel: 'Phân loại' },
  { value: 'HAS_CATEGORY', label: 'HAS_CATEGORY', desc: 'Có thể loại / nhóm', category: 'hierarchy', categoryLabel: 'Phân loại' },
  { value: 'HAS_SUBTYPE', label: 'HAS_SUBTYPE', desc: 'Có dạng phụ / kiểu con', category: 'hierarchy', categoryLabel: 'Phân loại' },
  { value: 'CLASSIFIED_INTO', label: 'CLASSIFIED_INTO', desc: 'Được phân loại vào', category: 'hierarchy', categoryLabel: 'Phân loại' },
  { value: 'IS_VARIANT_OF', label: 'IS_VARIANT_OF', desc: 'Là biến thể của', category: 'hierarchy', categoryLabel: 'Phân loại' },

  // 2. Thành phần & Bao hàm
  { value: 'PART_OF', label: 'PART_OF', desc: 'Là thành phần cấu tạo của', category: 'composition', categoryLabel: 'Bao hàm' },
  { value: 'COMPOSED_OF', label: 'COMPOSED_OF', desc: 'Cấu thành từ', category: 'composition', categoryLabel: 'Bao hàm' },
  { value: 'CONTAINS', label: 'CONTAINS', desc: 'Bao hàm / Chứa', category: 'composition', categoryLabel: 'Bao hàm' },

  // 3. Tiên quyết & Phụ thuộc
  { value: 'REQUIRES', label: 'REQUIRES', desc: 'Tiên quyết / Cần học trước', category: 'dependency', categoryLabel: 'Tiên quyết' },
  { value: 'DEPENDS_ON', label: 'DEPENDS_ON', desc: 'Phụ thuộc cấu trúc logic', category: 'dependency', categoryLabel: 'Tiên quyết' },
  { value: 'APPLIES_TO', label: 'APPLIES_TO', desc: 'Ứng dụng trong phạm vi', category: 'dependency', categoryLabel: 'Tiên quyết' },

  // 4. Liên kết & So sánh
  { value: 'ASSOCIATED_WITH', label: 'ASSOCIATED_WITH', desc: 'Liên kết mật thiết', category: 'association', categoryLabel: 'Liên kết' },
  { value: 'USES', label: 'USES', desc: 'Sử dụng / Vận dụng', category: 'association', categoryLabel: 'Liên kết' },
  { value: 'CONTRASTS_WITH', label: 'CONTRASTS_WITH', desc: 'Tương phản / So sánh', category: 'association', categoryLabel: 'Liên kết' },
  { value: 'IMPROVES_UPON', label: 'IMPROVES_UPON', desc: 'Cải tiến / Tối ưu từ', category: 'association', categoryLabel: 'Liên kết' },

  // 5. Nguyên nhân - Hệ quả & Giải pháp
  { value: 'CAUSES', label: 'CAUSES', desc: 'Gây ra / Nguyên nhân', category: 'causality', categoryLabel: 'Hệ quả' },
  { value: 'LEADS_TO', label: 'LEADS_TO', desc: 'Dẫn tới kết quả', category: 'causality', categoryLabel: 'Hệ quả' },
  { value: 'SOLVES', label: 'SOLVES', desc: 'Giải quyết bài toán', category: 'causality', categoryLabel: 'Hệ quả' },
  { value: 'PRODUCES', label: 'PRODUCES', desc: 'Tạo ra / Sinh ra', category: 'causality', categoryLabel: 'Hệ quả' },
  { value: 'YIELDS', label: 'YIELDS', desc: 'Mang lại kết quả', category: 'causality', categoryLabel: 'Hệ quả' },

  // 6. Nguồn gốc & Tác giả
  { value: 'CREATED_BY', label: 'CREATED_BY', desc: 'Được tạo ra bởi', category: 'origin', categoryLabel: 'Nguồn gốc' },
  { value: 'DISCOVERED_BY', label: 'DISCOVERED_BY', desc: 'Khám phá bởi', category: 'origin', categoryLabel: 'Nguồn gốc' },

  // 7. Quan hệ sư phạm bổ trợ (Pedagogical sub-relations)
  { value: 'HAS_PROCESS', label: 'HAS_PROCESS', desc: 'Bao gồm quy trình', category: 'pedagogical', categoryLabel: 'Sư phạm' },
  { value: 'STEP', label: 'STEP', desc: 'Bước thực hiện kế tiếp', category: 'pedagogical', categoryLabel: 'Sư phạm' },
  { value: 'DEFINES', label: 'DEFINES', desc: 'Định nghĩa / Giải nghĩa', category: 'pedagogical', categoryLabel: 'Sư phạm' },
  { value: 'HAS_EXERCISE', label: 'HAS_EXERCISE', desc: 'Bài tập rèn luyện', category: 'pedagogical', categoryLabel: 'Sư phạm' },
  { value: 'HAS_EXAMPLE', label: 'HAS_EXAMPLE', desc: 'Ví dụ minh họa', category: 'pedagogical', categoryLabel: 'Sư phạm' },
  { value: 'HAS_ARGUMENT', label: 'HAS_ARGUMENT', desc: 'Luận cứ / Chứng minh', category: 'pedagogical', categoryLabel: 'Sư phạm' },
];

const PAGE_SIZE = 8; // 2 cột x 4 hàng

export function DraftQuickConnectModal({
  isOpen,
  sourceLabel,
  targetLabel,
  sourceKind = 'KnowledgeEntity',
  targetKind = 'KnowledgeEntity',
  onClose,
  onSubmit,
}: DraftQuickConnectModalProps) {
  const [relationType, setRelationType] = useState('REQUIRES');
  const [customRelation, setCustomRelation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Gợi ý quan hệ mặc định thông minh theo loại node nguồn - đích
  useEffect(() => {
    if (isOpen) {
      let defaultType = 'REQUIRES';
      if (targetKind === 'Process') defaultType = 'HAS_PROCESS';
      else if (targetKind === 'ProcessStep' || targetKind === 'ExerciseStep') defaultType = 'STEP';
      else if (targetKind === 'Definition') defaultType = 'DEFINES';
      else if (targetKind === 'Exercise') defaultType = 'HAS_EXERCISE';
      else if (targetKind === 'Example') defaultType = 'HAS_EXAMPLE';
      else if (targetKind === 'Argument') defaultType = 'HAS_ARGUMENT';
      else if (sourceKind === 'Topic') defaultType = 'CONTAINS';

      setRelationType(defaultType);
      setCustomRelation('');
      setSearchQuery('');
      setActiveCategory('all');
      setCurrentPage(1);
    }
  }, [isOpen, sourceKind, targetKind]);

  // Lọc theo từ khóa tìm kiếm & danh mục
  const filteredRelations = useMemo(() => {
    return COMMON_RELATIONS.filter((r) => {
      const matchCat = activeCategory === 'all' || r.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.value.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.categoryLabel.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredRelations.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRelations = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredRelations.slice(start, start + PAGE_SIZE);
  }, [filteredRelations, safeCurrentPage]);

  // Đổi trang nếu tìm kiếm làm giảm số trang
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = (customRelation.trim() || relationType).toUpperCase().replace(/\s+/g, '_');
    if (!finalType) return;
    onSubmit(finalType);
    onClose();
  };

  const currentDisplayRelation = (customRelation.trim() || relationType).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3.5 text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[19px]">timeline</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Nối Trực tiếp 2 Thực thể Tri thức
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tự động kết nối bằng thao tác kéo thả trên canvas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Visual Link Direction Banner */}
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-0.5">
              Nút nguồn [{sourceKind}]
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]" title={sourceLabel}>
              {sourceLabel}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 px-1">
            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[18px]">
              arrow_forward
            </span>
            <span className="text-[10px] font-mono font-extrabold text-purple-700 dark:text-purple-300">
              {currentDisplayRelation}
            </span>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-0.5">
              Nút đích [{targetKind}]
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]" title={targetLabel}>
              {targetLabel}
            </p>
          </div>
        </div>

        {/* Search Bar & Category Filter Chips */}
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
              className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500/30 font-medium"
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
              { id: 'all', label: 'Tất cả (28)' },
              { id: 'dependency', label: 'Tiên quyết' },
              { id: 'hierarchy', label: 'Phân loại' },
              { id: 'composition', label: 'Bao hàm' },
              { id: 'association', label: 'Liên kết' },
              { id: 'causality', label: 'Hệ quả' },
              { id: 'origin', label: 'Nguồn gốc' },
              { id: 'pedagogical', label: 'Sư phạm' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer border-none ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable / Paginated Grid of Relations */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Chọn loại quan hệ ({filteredRelations.length}):
              </span>
              {totalPages > 1 && (
                <span className="font-mono text-[10px]">
                  Trang {safeCurrentPage} / {totalPages}
                </span>
              )}
            </div>

            {paginatedRelations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                Không tìm thấy loại quan hệ nào khớp với &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {paginatedRelations.map((r) => {
                  const isSelected = !customRelation && relationType === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setRelationType(r.value);
                        setCustomRelation('');
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[11px] truncate">{r.value}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {r.desc}
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 shrink-0 font-medium">
                        {r.categoryLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls Bar */}
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
                    className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    ‹ Trước
                  </button>
                  <span className="text-[10px] font-mono font-bold px-1 text-slate-700 dark:text-slate-300">
                    {safeCurrentPage}/{totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Sau ›
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Custom Relation input */}
          <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Hoặc nhập loại quan hệ tùy chỉnh:
            </label>
            <input
              type="text"
              placeholder="VD: IS_A, USES, CONTRASTS_WITH, OPTIMIZES_FOR..."
              value={customRelation}
              onChange={(e) => setCustomRelation(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase font-mono outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border-none bg-transparent"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors border-none"
            >
              <span className="material-symbols-outlined text-[15px]">check</span>
              <span>Tạo liên kết ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
