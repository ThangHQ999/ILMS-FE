'use client';

import React, { useState } from 'react';
import type {
  PipelineSettings,
  ClusterMetrics,
} from '../../schemas/materials-tasks.schema';

interface PipelineSettingsCardProps {
  settings: PipelineSettings;
  clusterMetrics: ClusterMetrics;
  onUpdateSettings: (newSettings: Partial<PipelineSettings>) => void;
  onResetSettings: () => void;
  onToast?: (message: string) => void;
}

export function PipelineSettingsCard({
  settings,
  clusterMetrics,
  onUpdateSettings,
  onResetSettings,
  onToast,
}: PipelineSettingsCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    if (onToast) onToast('Đã lưu cấu hình AI pipeline thành công!');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    onResetSettings();
    if (onToast) onToast('Đã khôi phục thiết lập AI mặc định!');
  };

  return (
    <div className="flex flex-col gap-6 sticky top-24" id="settings-panel">
      {/* 1. Main Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
              psychology
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Cấu hình AI Xử lý Thông minh
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/60 dark:border-blue-900/40">
            Tự động áp dụng
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Các mô-đun AI được thiết lập mặc định sẽ áp dụng tức thì cho các tệp mới tải lên trong hàng đợi hiện thời.
        </p>

        <div className="flex flex-col gap-3 pt-1">
          {/* Module 1: Knowledge Graph Extraction */}
          <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-3.5 flex flex-col gap-1 border border-slate-200/60 dark:border-slate-800/80 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                  account_tree
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Trích xuất Đồ thị tri thức
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Knowledge Graph Extraction
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.knowledgeGraphExtraction}
                  onChange={(e) =>
                    onUpdateSettings({ knowledgeGraphExtraction: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tự động gom nhóm entity, liên kết các thuật toán vào ma trận kiến thức chuẩn IEEE/ACM của bộ môn.
            </p>
          </div>

          {/* Module 2: Bloom-Taxonomy Auto Quiz */}
          <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-3.5 flex flex-col gap-1 border border-slate-200/60 dark:border-slate-800/80 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                  quiz
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Tự động sinh đề kiểm tra
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Bloom-Taxonomy Auto Quiz
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.bloomAutoQuiz}
                  onChange={(e) =>
                    onUpdateSettings({ bloomAutoQuiz: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tạo tự động 10 - 20 câu hỏi trắc nghiệm chia đều theo 4 bậc: Nhớ, Hiểu, Vận dụng, Phân tích.
            </p>
          </div>

          {/* Module 3: Socratic AI Tutor Knowledge Feeding */}
          <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-3.5 flex flex-col gap-1 border border-slate-200/60 dark:border-slate-800/80 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                  forum
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Nạp Vector cho Socratic Tutor
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Socratic AI Vector Embedding
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.socraticVectorEmbedding}
                  onChange={(e) =>
                    onUpdateSettings({ socraticVectorEmbedding: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Đẩy dữ liệu bóc tách vào Pinecone/Milvus để trợ lý AI học tập có thể đối thoại hướng dẫn sinh viên 24/7.
            </p>
          </div>

          {/* GPU Allocation Mode */}
          <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-3.5 flex flex-col gap-2 border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Chế độ phân bổ GPU Cloud
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => onUpdateSettings({ gpuMode: 'speed' })}
                className={`py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  settings.gpuMode === 'speed'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">speed</span>
                <span>Tốc độ tối đa</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ gpuMode: 'eco' })}
                className={`py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  settings.gpuMode === 'eco'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">energy_savings_leaf</span>
                <span>Tiết kiệm Token</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Khôi phục mặc định
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            {isSaved ? '✓ Đã lưu cấu hình' : 'Lưu thiết lập Pipeline'}
          </button>
        </div>
      </div>

      {/* 2. Cluster Health Visualizer Mini-Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
              memory
            </span>
            <span>Cụm AI Inference Worker</span>
          </span>
          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
            GPU Load: {clusterMetrics.gpuLoadPercent}%
          </span>
        </div>

        {/* Sparkline SVG Chart */}
        <div className="w-full h-12 bg-slate-50 dark:bg-slate-850 rounded-xl p-1.5 flex items-end overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
          <svg className="w-full h-full text-blue-600 dark:text-blue-400" fill="none" preserveAspectRatio="none" viewBox="0 0 100 30">
            <path
              d="M0 25 L10 22 L20 28 L30 15 L40 18 L50 8 L60 12 L70 5 L80 18 L90 10 L100 14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M0 25 L10 22 L20 28 L30 15 L40 18 L50 8 L60 12 L70 5 L80 18 L90 10 L100 14 L100 30 L0 30 Z"
              fill="currentColor"
              fillOpacity="0.12"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <span>Active Worker: {clusterMetrics.activeWorkers} Nodes</span>
          <span>
            Memory: {clusterMetrics.memoryUsedGb} / {clusterMetrics.memoryTotalGb} GB VRAM
          </span>
        </div>
      </div>
    </div>
  );
}

