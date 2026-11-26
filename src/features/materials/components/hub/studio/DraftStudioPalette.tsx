'use client';

import React, { useState, useMemo } from 'react';

export interface DraftStudioPaletteNodeItem {
  id: string;
  label: string;
  kind: string;
  path: string;
  description?: string;
}

interface ShapeItem {
  kind: string;
  label: string;
  sublabel: string;
  icon: string;
  color: {
    bg: string;
    border: string;
    text: string;
    dot: string;
  };
}

const SHAPE_ITEMS: ShapeItem[] = [
  {
    kind: 'Topic',
    label: 'Chủ đề',
    sublabel: 'Gom nhóm học phần',
    icon: 'folder_special',
    color: {
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-600',
    },
  },
  {
    kind: 'KnowledgeEntity',
    label: 'Thực thể Tri thức',
    sublabel: 'Khái niệm cốt lõi',
    icon: 'hub',
    color: {
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-[#0059bb]',
    },
  },
  {
    kind: 'Definition',
    label: 'Định nghĩa',
    sublabel: 'Ý nghĩa học thuật',
    icon: 'menu_book',
    color: {
      bg: 'bg-sky-50 dark:bg-sky-950/50',
      border: 'border-sky-200 dark:border-sky-800',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
    },
  },
  {
    kind: 'Process',
    label: 'Quy trình',
    sublabel: 'Trình tự thực thi',
    icon: 'linear_scale',
    color: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      border: 'border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-700 dark:text-indigo-300',
      dot: 'bg-indigo-600',
    },
  },
  {
    kind: 'ProcessStep',
    label: 'Bước quy trình',
    sublabel: 'Từng bước hành động',
    icon: 'subdirectory_arrow_right',
    color: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/50',
      border: 'border-cyan-200 dark:border-cyan-800',
      text: 'text-cyan-700 dark:text-cyan-300',
      dot: 'bg-cyan-600',
    },
  },
  {
    kind: 'Exercise',
    label: 'Bài tập rèn luyện',
    sublabel: 'Thực hành củng cố',
    icon: 'fitness_center',
    color: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-600',
    },
  },
  {
    kind: 'ExerciseStep',
    label: 'Bước giải bài tập',
    sublabel: 'Chỉ dẫn giải quyết',
    icon: 'format_list_numbered',
    color: {
      bg: 'bg-teal-50 dark:bg-teal-950/50',
      border: 'border-teal-200 dark:border-teal-800',
      text: 'text-teal-700 dark:text-teal-300',
      dot: 'bg-teal-600',
    },
  },
  {
    kind: 'Example',
    label: 'Ví dụ minh họa',
    sublabel: 'Mẫu thực tiễn',
    icon: 'lightbulb',
    color: {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
  },
  {
    kind: 'Argument',
    label: 'Luận cứ / Chứng minh',
    sublabel: 'Luận điểm & bằng chứng',
    icon: 'psychology',
    color: {
      bg: 'bg-pink-50 dark:bg-pink-950/50',
      border: 'border-pink-200 dark:border-pink-800',
      text: 'text-pink-700 dark:text-pink-300',
      dot: 'bg-pink-600',
    },
  },
];

interface DraftStudioPaletteProps {
  isOpen: boolean;
  nodes?: DraftStudioPaletteNodeItem[];
  selectedPath?: string;
  onToggle: () => void;
  onAddNode: (kind: string) => void;
  onOpenJsonStudio?: () => void;
  onSelectAndFocusNode?: (path: string, nodeId: string) => void;
}

export function DraftStudioPalette({
  isOpen,
  nodes = [],
  selectedPath,
  onToggle,
  onAddNode,
  onOpenJsonStudio,
  onSelectAndFocusNode,
}: DraftStudioPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'shapes' | 'search'>('shapes');

  const handleDragStart = (e: React.DragEvent, kind: string) => {
    e.dataTransfer.setData('application/reactflow-kind', kind);
    e.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.trim().toLowerCase();
    return nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.kind.toLowerCase().includes(q) ||
        n.path.toLowerCase().includes(q) ||
        (n.description && n.description.toLowerCase().includes(q))
    );
  }, [nodes, searchQuery]);

  // When user types in search box, automatically switch to search tab
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim() && activeTab !== 'search') {
      setActiveTab('search');
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute top-16 left-3 z-20 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xl backdrop-blur-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
        title="Mở Thư viện khối kéo thả & Tìm kiếm (Alt+1)"
      >
        <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
          shapes
        </span>
        <span>Thư viện &amp; Tìm kiếm</span>
      </button>
    );
  }

  return (
    <aside className="w-64 shrink-0 bg-white/95 dark:bg-slate-900/95 border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-full backdrop-blur-md z-20 select-none shadow-sm">
      {/* Palette Header */}
      <div className="h-11 px-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400">
            shapes
          </span>
          <span>Khối sơ đồ (Draw.io)</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
          title="Thu gọn thư viện"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>
      </div>

      {/* Search Input Box */}
      <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/30">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-[16px] text-slate-400 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm nhanh thực thể..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('shapes');
              }}
              className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Tab switcher: Shapes vs Search Results */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
          <button
            type="button"
            onClick={() => setActiveTab('shapes')}
            className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'shapes'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">category</span>
            <span>Khối sơ đồ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">manage_search</span>
            <span>Tìm kiếm ({searchQuery.trim() ? filteredNodes.length : nodes.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {activeTab === 'shapes' ? (
          <>
            <div className="px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400">
              💡 Kéo thả khối vào canvas hoặc nhấp nút <strong className="text-blue-600 dark:text-blue-400">[+]</strong> để thêm nhanh.
            </div>

            {SHAPE_ITEMS.map((item) => (
              <div
                key={item.kind}
                draggable
                onDragStart={(e) => handleDragStart(e, item.kind)}
                className={`group relative p-2.5 rounded-xl border ${item.color.border} ${item.color.bg} transition-all hover:shadow-md hover:scale-[1.02] cursor-grab active:cursor-grabbing text-left flex items-center justify-between gap-2`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg ${item.color.bg} border ${item.color.border} ${item.color.text} flex items-center justify-center shrink-0`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {item.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-tight truncate ${item.color.text}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {item.sublabel}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddNode(item.kind)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0 shadow-xs"
                  title={`Thêm ${item.label} vào đồ thị`}
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                </button>
              </div>
            ))}

            {onOpenJsonStudio && (
              <button
                type="button"
                onClick={onOpenJsonStudio}
                className="w-full mt-2 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 text-slate-200 transition-all cursor-pointer flex items-center gap-3 text-left shadow-xs group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">data_object</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold group-hover:text-blue-400 transition-colors">
                    Chèn từ JSON Code...
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Tự động tạo nhóm khối từ JSON
                  </div>
                </div>
              </button>
            )}
          </>
        ) : (
          /* Search Results List */
          <div className="space-y-1.5">
            <div className="px-1 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>Kết quả ({filteredNodes.length})</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  type="button"
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Hiện tất cả
                </button>
              )}
            </div>

            {filteredNodes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">
                  search_off
                </span>
                <p>Không tìm thấy thực thể phù hợp với &quot;{searchQuery}&quot;</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 text-xs font-medium cursor-pointer"
                >
                  Xóa từ khóa
                </button>
              </div>
            ) : (
              filteredNodes.map((n) => {
                const isSelected = selectedPath === n.path;
                return (
                  <div
                    key={n.id}
                    onClick={() => onSelectAndFocusNode?.(n.path, n.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase truncate max-w-[80px]">
                          {n.kind}
                        </span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {n.label}
                        </span>
                      </div>
                      {n.description && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {n.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAndFocusNode?.(n.path, n.id);
                      }}
                      className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer shrink-0"
                      title="Di chuyển tâm nhìn tới thực thể này"
                    >
                      <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
