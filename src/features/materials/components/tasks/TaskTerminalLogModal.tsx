'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { MaterialBackgroundTask } from '../../schemas/materials-tasks.schema';

interface TaskTerminalLogModalProps {
  task: MaterialBackgroundTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskTerminalLogModal({
  task,
  isOpen,
  onClose,
}: TaskTerminalLogModalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task?.logs, autoScroll, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const logs = task.logs || [
    { timestamp: '10:14:02', level: 'info' as const, text: `Đang khởi tạo tiến trình cho tệp ${task.filename}` },
    { timestamp: '10:14:15', level: 'info' as const, text: 'Kết nối mô hình AI phân tích OCR & Graph...' },
  ];

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-[18px]">terminal</span>
              <span className="font-mono text-xs text-slate-200 font-semibold truncate max-w-xs sm:max-w-md">
                ai-worker@{task.filename}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLogs}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Terminal Sub-bar */}
        <div className="px-5 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Trạng thái: <strong className="text-emerald-400">{task.status}</strong></span>
            <span>Tiến độ: <strong className="text-blue-400">{task.progressPercent}%</strong></span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Cuộn tự động</span>
          </label>
        </div>

        {/* Terminal Body */}
        <div className="p-5 font-mono text-xs bg-slate-950 min-h-[320px] max-h-[460px] overflow-y-auto space-y-2 select-text">
          <div className="text-slate-500 text-[11px]">
            # ILMS AI Inference Worker v4.2 [Node: cluster-ap-southeast-1]
          </div>
          <div className="text-slate-500 text-[11px]">
            # Khởi tạo luồng xử lý: {task.id} (Tệp: {task.filename})
          </div>
          <div className="h-2" />

          {logs.map((log, index) => {
            const isError = log.level === 'error';
            const isSuccess = log.level === 'success';
            const isWarn = log.level === 'warn';

            return (
              <div key={index} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                <span
                  className={`font-semibold shrink-0 select-none ${
                    isError
                      ? 'text-red-400'
                      : isSuccess
                      ? 'text-emerald-400'
                      : isWarn
                      ? 'text-amber-400'
                      : 'text-blue-400'
                  }`}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span
                  className={
                    isError
                      ? 'text-red-300'
                      : isSuccess
                      ? 'text-emerald-200'
                      : isWarn
                      ? 'text-amber-200'
                      : 'text-slate-300'
                  }
                >
                  {log.text}
                </span>
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">Token Stream Active • Bóc tách song song 4 luồng</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}

