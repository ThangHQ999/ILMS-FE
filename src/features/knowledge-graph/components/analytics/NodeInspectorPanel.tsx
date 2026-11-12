'use client';

import React, { useState, useEffect } from 'react';
import { KnowledgeNodeData, KnowledgeCategory } from '../../types';

interface NodeInspectorPanelProps {
  node: KnowledgeNodeData | null;
  onSaveNode: (id: string, updates: Partial<KnowledgeNodeData>) => void;
  onDeleteNode: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function NodeInspectorPanel({
  node,
  onSaveNode,
  onDeleteNode,
  isCollapsed,
  onToggleCollapse,
}: NodeInspectorPanelProps) {
  const [title, setTitle] = useState('');
  const [sublabel, setSublabel] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('ds');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [description, setDescription] = useState('');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  useEffect(() => {
    if (node) {
      setTitle(node.label || '');
      setSublabel(node.sublabel || '');
      setCategory(node.category);
      setTimeComplexity(node.complexity?.time || '');
      setSpaceComplexity(node.complexity?.space || '');
      setDescription(node.description || '');
      setIsSavedFeedback(false);
    }
  }, [node]);

  if (isCollapsed) {
    return null;
  }

  if (!node) {
    return (
      <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-none border-none flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-slate-400 mb-3">
          <span className="material-symbols-outlined text-[32px]">touch_app</span>
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-[#E3E3E3]">
          Chưa chọn thực thể
        </h4>
        <p className="text-xs text-slate-500 dark:text-[#C4C7C5] max-w-xs mt-1">
          Nhấp vào bất kỳ Node nào trên khung vẽ để xem và chỉnh sửa thông tin chi tiết.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    onSaveNode(node.id, {
      label: title,
      sublabel,
      category: category as Exclude<KnowledgeCategory, 'all'>,
      complexity: {
        time: timeComplexity,
        space: spaceComplexity,
      },
      description,
    });
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  return (
    <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-none border-none flex flex-col gap-5 transition-all">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4 border-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-xs font-medium flex items-center gap-1 border-none">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Node Editor
            </span>
            <span className="text-[11px] font-mono text-slate-400">#{node.id}</span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors"
            title="Thu gọn bảng chỉnh sửa"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">dock_to_right</span>
          </button>
        </div>

        <div className="mt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#E3E3E3]">
            Chỉnh sửa Thực thể Tri thức
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#C4C7C5]">
            Cập nhật định nghĩa, tham số và phân loại nút đồ thị
          </p>
        </div>
      </div>

      {/* Form Controls */}
      <div className="flex flex-col gap-4">
        {/* Field 1: Tên khái niệm */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-[#C4C7C5] mb-1.5 block">
            Tên khái niệm (Concept Title)
          </label>
          <div className="flex items-center bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2.5 rounded-2xl border-none transition-all">
            <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[18px] mr-2">
              title
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-xs font-bold text-slate-900 dark:text-[#E3E3E3]"
              placeholder="Nhập tên thực thể..."
            />
          </div>
        </div>

        {/* Field 2: Nhóm kiến thức */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-[#C4C7C5] mb-1.5 block">
            Nhóm kiến thức / Chủ đề
          </label>
          <div className="bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl px-3.5 py-2.5 border-none transition-all">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
              className="w-full bg-transparent border-0 outline-none text-xs text-slate-900 dark:text-[#E3E3E3] font-medium cursor-pointer"
            >
              <option value="ds">🟦 Cấu trúc dữ liệu (Data Structures)</option>
              <option value="algo">🟪 Thuật toán tối ưu (Algorithms)</option>
              <option value="icpc">🟩 ICPC Lab & Đề thi chuyên sâu</option>
              <option value="plo">🟧 Chuẩn năng lực đầu ra (PLO)</option>
              <option value="math">🟨 Toán rời rạc & Hình học</option>
            </select>
          </div>
        </div>

        {/* Field 3: Thông số kỹ thuật & Độ phức tạp */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-[#C4C7C5] mb-1.5 block">
            Thông số kỹ thuật & Độ phức tạp
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F0F4F9] dark:bg-[#282A2C] p-2.5 rounded-2xl border-none">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Thời gian (Time)
              </span>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder="O(log N)"
                className="bg-transparent border-0 outline-none w-full text-xs font-mono font-bold text-[#0B57D0] dark:text-[#A8C7FA] mt-0.5"
              />
            </div>
            <div className="bg-[#F0F4F9] dark:bg-[#282A2C] p-2.5 rounded-2xl border-none">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Không gian (Space)
              </span>
              <input
                type="text"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                placeholder="O(4N)"
                className="bg-transparent border-0 outline-none w-full text-xs font-mono font-bold text-slate-800 dark:text-[#E3E3E3] mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Field 4: Nội dung chi tiết Markdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-[#C4C7C5]">
              Nội dung chi tiết & Định nghĩa cốt lõi
            </label>
            <span className="text-[10px] font-mono text-slate-400">Markdown</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl p-3 border-none outline-none text-xs text-slate-800 dark:text-[#E3E3E3] resize-none leading-relaxed"
            placeholder="Soạn thảo lý thuyết giải thích hoặc điều kiện bổ trợ..."
          />
        </div>

        {/* Field 5: Quản lý liên kết kề */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-[#C4C7C5]">
              Liên kết kề hiện tại
            </span>
            <span className="text-[11px] font-mono text-[#0B57D0] dark:text-[#A8C7FA] font-bold">
              {(node.prerequisites?.length || 0) + (node.successors?.length || 0)} quan hệ
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
            {node.prerequisites?.map((prereq) => (
              <div
                key={prereq}
                className="flex items-center justify-between px-3 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-slate-800 dark:text-[#E3E3E3] border-none"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                    arrow_back
                  </span>
                  {prereq} (Tiên quyết)
                </span>
              </div>
            ))}
            {node.successors?.map((succ) => (
              <div
                key={succ}
                className="flex items-center justify-between px-3 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-slate-800 dark:text-[#E3E3E3] border-none"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-purple-600 dark:text-purple-400">
                    arrow_forward
                  </span>
                  {succ} (Mở rộng)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 mt-auto">
          <button
            onClick={handleSave}
            className="w-full py-2.5 px-6 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap font-medium text-xs border-none shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSavedFeedback ? 'done' : 'save'}
            </span>
            <span>{isSavedFeedback ? 'Đã lưu thay đổi!' : 'Lưu thay đổi'}</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => alert(`Xem trước lý thuyết: ${title}`)}
              className="py-2.5 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium border-none shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Xem trước</span>
            </button>
            <button
              onClick={() => onDeleteNode(node.id)}
              className="py-2.5 px-4 rounded-full bg-[#FAD2CF] hover:bg-[#F7B6B2] text-[#B3261E] dark:bg-[#3C1919] dark:hover:bg-[#4E2020] dark:text-[#F28B82] text-xs font-medium border-none shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Xóa Node</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
