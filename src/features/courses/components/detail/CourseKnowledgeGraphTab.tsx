'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CourseKnowledgeGraphTabProps {
  courseName: string;
}

interface ConceptNode {
  id: string;
  label: string;
  level: string;
  category: string;
  prerequisites: string[];
  masteryPercent: number;
}

const MOCK_CONCEPTS: ConceptNode[] = [
  {
    id: 'c-01',
    label: 'Cây nhị phân tìm kiếm (BST)',
    level: 'Căn bản',
    category: 'Cấu trúc cây',
    prerequisites: ['Con trỏ C++', 'Đệ quy'],
    masteryPercent: 95,
  },
  {
    id: 'c-02',
    label: 'Cây AVL & Phép xoay tự cân bằng',
    level: 'Nâng cao',
    category: 'Cấu trúc cây',
    prerequisites: ['Cây BST', 'Hệ số cân bằng'],
    masteryPercent: 88,
  },
  {
    id: 'c-03',
    label: 'Cây phân đoạn (Segment Tree)',
    level: 'Chuyên sâu',
    category: 'Truy vấn khoảng',
    prerequisites: ['Cây nhị phân', 'Đệ quy chia để trị'],
    masteryPercent: 72,
  },
  {
    id: 'c-04',
    label: 'Lazy Propagation trên Segment Tree',
    level: 'Chuyên sâu',
    category: 'Truy vấn khoảng',
    prerequisites: ['Segment Tree'],
    masteryPercent: 65,
  },
  {
    id: 'c-05',
    label: 'Cây chỉ số nhị phân (Fenwick / BIT)',
    level: 'Nâng cao',
    category: 'Truy vấn khoảng',
    prerequisites: ['Bitwise manipulation', 'Mảng tiền tố'],
    masteryPercent: 80,
  },
  {
    id: 'c-06',
    label: 'Disjoint Set Union (DSU)',
    level: 'Trung bình',
    category: 'Đồ thị',
    prerequisites: ['Mảng & Cây'],
    masteryPercent: 92,
  },
  {
    id: 'c-07',
    label: 'Thuật toán Dijkstra (Heap-optimized)',
    level: 'Nâng cao',
    category: 'Đồ thị',
    prerequisites: ['Binary Heap', 'BFS', 'Ma trận kề'],
    masteryPercent: 84,
  },
];

export function CourseKnowledgeGraphTab({ courseName }: CourseKnowledgeGraphTabProps) {
  const t = useTranslations('courses.detail');
  const [selectedNode, setSelectedNode] = useState<ConceptNode>(MOCK_CONCEPTS[1]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-[3px] border-slate-300 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('kgSummary')}
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
              142 Nodes Tri thức
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('kgDesc')}
          </p>
        </div>

        <Link
          href="/knowledge-graph"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">account_tree</span>
          <span>{t('btnExploreKg')}</span>
        </Link>
      </div>

      {/* Graph Visual Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Concept Map Visual */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border-[3px] border-slate-300 dark:border-slate-700 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">bubble_chart</span>
              <span>Bản đồ quan hệ khái niệm</span>
            </h3>
            <span className="text-xs text-slate-400">Bấm vào từng Node để xem chi tiết</span>
          </div>

          {/* Node Grid / Flow Pills */}
          <div className="flex-1 min-h-[300px] rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 p-6 flex flex-wrap content-start gap-3 relative overflow-hidden border border-dashed border-slate-200 dark:border-slate-800">
            {MOCK_CONCEPTS.map((node) => {
              const isSelected = selectedNode.id === node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-left flex items-center gap-2.5 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105 z-10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      node.masteryPercent >= 85
                        ? 'bg-emerald-400'
                        : node.masteryPercent >= 70
                        ? 'bg-blue-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>{node.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    {node.masteryPercent}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Inspector Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border-[3px] border-slate-300 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                {selectedNode.category}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {selectedNode.level}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              {selectedNode.label}
            </h3>

            <div className="my-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500">Mức độ hoàn thành lớp:</span>
                <span className="font-bold text-blue-600 font-mono">{selectedNode.masteryPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${selectedNode.masteryPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Kiến thức tiên quyết (Prerequisites):
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.prerequisites.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Xem bài giảng liên kết</span>
          </button>
        </div>
      </div>
    </div>
  );
}

