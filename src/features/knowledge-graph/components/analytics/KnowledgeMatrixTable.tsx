'use client';

import React from 'react';
import { KnowledgeNodeData } from '../../types';

interface KnowledgeMatrixTableProps {
  nodes: KnowledgeNodeData[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onSwitchToGraph: () => void;
}

export function KnowledgeMatrixTable({
  nodes,
  selectedNodeId,
  onSelectNode,
  onSwitchToGraph,
}: KnowledgeMatrixTableProps) {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'ds':
        return 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]';
      case 'algo':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300';
      case 'icpc':
        return 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]';
      case 'plo':
        return 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784]';
      default:
        return 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'ds':
        return 'Cấu trúc DL';
      case 'algo':
        return 'Thuật toán';
      case 'icpc':
        return 'ICPC Lab';
      case 'plo':
        return 'Chuẩn PLO';
      default:
        return 'Toán học';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-none border-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-[#E3E3E3]">
            Bảng Ma Trận Thực Thể Tri Thức (Knowledge Matrix)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-0.5">
            Chế độ danh mục chuẩn cho khả năng truy cập dễ dàng & tra cứu nhanh ({nodes.length} thực thể)
          </p>
        </div>
        <button
          onClick={onSwitchToGraph}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap text-xs font-medium border-none shadow-none transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">bubble_chart</span>
          <span>Xem trên mạng lưới 2D</span>
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-700 dark:text-[#C4C7C5] font-semibold border-none">
              <th className="py-3 px-4 rounded-l-2xl">Thực thể</th>
              <th className="py-3 px-4">Phân loại</th>
              <th className="py-3 px-4">Độ phức tạp</th>
              <th className="py-3 px-4">Liên kết kề</th>
              <th className="py-3 px-4">Độ thành thạo</th>
              <th className="py-3 px-4 rounded-r-2xl text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F9] dark:divide-[#282A2C]/50">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const relatedSummary = [
                ...(node.prerequisites || []),
                ...(node.successors || []),
              ]
                .slice(0, 3)
                .join(', ');

              return (
                <tr
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#D3E3FD]/40 dark:bg-[#162B4D]'
                      : 'hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-[#E3E3E3]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[18px]">
                        {node.icon || 'adjust'}
                      </span>
                      <div>
                        <span>{node.label}</span>
                        {node.sublabel && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {node.sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border-none ${getCategoryBadge(
                        node.category
                      )}`}
                    >
                      {getCategoryName(node.category)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
                    {node.complexity.time}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-[#C4C7C5] max-w-xs truncate">
                    {relatedSummary || 'Độc lập'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[#E1E5EA] dark:bg-[#282A2C] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0B57D0] dark:bg-[#A8C7FA] h-full rounded-full transition-all"
                          style={{ width: `${node.masteryScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                        {node.masteryScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNode(node.id);
                        onSwitchToGraph();
                      }}
                      className="px-4 py-1.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium text-[11px] border-none shadow-none transition-colors"
                      type="button"
                    >
                      Định vị
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
