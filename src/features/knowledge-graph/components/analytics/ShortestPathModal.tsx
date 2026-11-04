'use client';

import React, { useState, useMemo } from 'react';
import { KnowledgeNodeData, ShortestPathResult } from '../../types';
import { findDijkstraShortestPath } from '../../services/knowledge-graph.service';

interface ShortestPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: KnowledgeNodeData[];
  onConfirmPath: (result: ShortestPathResult) => void;
}

export function ShortestPathModal({
  isOpen,
  onClose,
  nodes,
  onConfirmPath,
}: ShortestPathModalProps) {
  const [sourceId, setSourceId] = useState('prefix-sum');
  const [targetId, setTargetId] = useState('lazy-prop');

  const pathResult = useMemo(() => {
    return findDijkstraShortestPath(sourceId, targetId, nodes);
  }, [sourceId, targetId, nodes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[22px]">alt_route</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tìm lộ trình tri thức tối ưu
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Thuật toán Dijkstra đồ thị tri thức
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Thuật toán Dijkstra dựa trên đồ thị tri thức sẽ đề xuất các mắt xích tiền đề ít tốn thời gian nhất để đạt chuẩn năng lực mong muốn.
        </p>

        {/* Node Selectors */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
              Điểm xuất phát (Node nguồn):
            </label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">
                trip_origin
              </span>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="bg-transparent border-0 outline-none w-full text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id} className="dark:bg-slate-900">
                    {n.label} ({n.complexity.time})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-1 text-slate-400">
            <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
              Mục tiêu chinh phục (Node đích):
            </label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px] mr-2">
                location_on
              </span>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="bg-transparent border-0 outline-none w-full text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id} className="dark:bg-slate-900">
                    {n.label} ({n.complexity.time})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Path Preview Box */}
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-amber-500">
                auto_awesome
              </span>
              Lộ trình đề xuất ({pathResult.stepsCount} chặng):
            </span>
            <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
              ~{pathResult.totalTimeEstimate}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 font-mono pt-1">
            {pathResult.nodeLabels.map((lbl, idx) => (
              <React.Fragment key={lbl}>
                <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-sm">
                  {lbl}
                </span>
                {idx < pathResult.nodeLabels.length - 1 && (
                  <span className="text-slate-400">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            type="button"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              onConfirmPath(pathResult);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            <span>Kích hoạt lộ trình học</span>
          </button>
        </div>
      </div>
    </div>
  );
}
