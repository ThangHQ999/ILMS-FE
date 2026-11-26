'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  validateAndParseImportJson,
  mergeJsonImportIntoGraph,
  SAMPLE_INSERT_ENTITIES_JSON,
  type JsonImportValidation,
} from '../../../utils/draft-json-importer';
import type { DraftGraphData } from '../../../utils/draft-graph-crud';
import { parseDraftGraph, stringifyDraftGraph } from '../../../utils/draft-graph-crud';

interface DraftJsonStudioModalProps {
  isOpen: boolean;
  currentGraphText: string;
  editable: boolean;
  onClose: () => void;
  onApplyGraph: (nextGraphText: string) => void;
  onShowToast?: (msg: string) => void;
}

export function DraftJsonStudioModal({
  isOpen,
  currentGraphText,
  editable,
  onClose,
  onApplyGraph,
  onShowToast,
}: DraftJsonStudioModalProps) {
  const [activeTab, setActiveTab] = useState<'insert' | 'view'>('insert');
  const [insertJsonText, setInsertJsonText] = useState<string>(SAMPLE_INSERT_ENTITIES_JSON);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Validate inserted JSON in real time
  const validation: JsonImportValidation = useMemo(() => {
    return validateAndParseImportJson(insertJsonText);
  }, [insertJsonText]);

  const handlePrettify = useCallback(() => {
    try {
      const parsed = JSON.parse(insertJsonText);
      setInsertJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore if invalid
    }
  }, [insertJsonText]);

  const handleCopyFullJson = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(currentGraphText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
      onShowToast?.('Đã sao chép toàn bộ mã JSON đồ thị vào Clipboard!');
    }
  }, [currentGraphText, onShowToast]);

  const handleDownloadJson = useCallback(() => {
    try {
      const blob = new Blob([currentGraphText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `draft-graph-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      onShowToast?.('Không thể tải file JSON.');
    }
  }, [currentGraphText, onShowToast]);

  const handleExecuteInsert = useCallback(() => {
    if (!validation.isValid || !validation.payload) return;

    let currentGraph: DraftGraphData = {};
    try {
      currentGraph = parseDraftGraph(currentGraphText);
    } catch {
      currentGraph = {};
    }

    const nextGraph = mergeJsonImportIntoGraph(currentGraph, validation.payload, importMode);
    const serialized = stringifyDraftGraph(nextGraph);

    onApplyGraph(serialized);
    onClose();

    const count = validation.entitiesCount;
    onShowToast?.(
      importMode === 'replace'
        ? `Đã thay thế toàn bộ đồ thị với ${count} thực thể mới!`
        : `Đã chèn thành công ${count} thực thể tri thức mới vào đồ thị!`
    );
  }, [currentGraphText, importMode, onApplyGraph, onClose, onShowToast, validation]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0F172A] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">data_object</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Trung tâm Mã nguồn JSON &amp; Chèn Thực thể (Draw.io Style)
              </h2>
              <p className="text-xs text-slate-400">
                Xem toàn bộ mã đồ thị hoặc dán mã JSON để tự động sinh ra các khối tri thức trực quan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('insert')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'insert'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Chèn nhóm Thực thể từ JSON</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'view'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Xem toàn bộ JSON Đồ thị</span>
            </button>
          </div>

          {activeTab === 'insert' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInsertJsonText(SAMPLE_INSERT_ENTITIES_JSON)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Tải đoạn JSON mẫu gồm Binary Search và Linear Search"
              >
                <span className="material-symbols-outlined text-[15px] text-amber-400">auto_fix_high</span>
                <span>Tải mẫu JSON chuẩn</span>
              </button>

              <button
                type="button"
                onClick={handlePrettify}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Định dạng thụt lề chuẩn JSON"
              >
                <span className="material-symbols-outlined text-[15px]">format_align_left</span>
                <span>Định dạng</span>
              </button>

              <button
                type="button"
                onClick={() => setInsertJsonText('')}
                className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                title="Xóa trắng khung soạn thảo"
              >
                Xóa trắng
              </button>
            </div>
          )}

          {activeTab === 'view' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFullJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copyFeedback ? 'check' : 'content_copy'}
                </span>
                <span>{copyFeedback ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Tải file .json</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1 Content: Insert Knowledge Entities from JSON */}
        {activeTab === 'insert' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {/* Live Parsing Summary / Alert */}
            {validation.isValid ? (
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Cú pháp JSON hoàn toàn hợp lệ!</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-bold border border-blue-700/50">
                    {validation.entitiesCount} Thực thể
                  </span>
                  {validation.topicsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 font-bold border border-purple-700/50">
                      {validation.topicsCount} Chủ đề
                    </span>
                  )}
                  {validation.relationsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 font-bold border border-amber-700/50">
                      {validation.relationsCount} Liên kết quan hệ
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-rose-950/40 border border-rose-500/40 p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
                <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0 mt-0.5">
                  error
                </span>
                <span>{validation.errorMessage}</span>
              </div>
            )}

            {/* Code Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Dán đoạn mã JSON (Mảng [ ... ] hoặc Đối tượng {`{ ... }`}):</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {insertJsonText.length} ký tự
                </span>
              </label>
              <textarea
                value={insertJsonText}
                onChange={(e) => setInsertJsonText(e.target.value)}
                spellCheck={false}
                rows={14}
                placeholder='[ { "name": "Tên thực thể", "description": "Mô tả", "processes": [...] } ]'
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Merge vs Replace Mode */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200">Phương thức chèn vào đồ thị:</div>
                <div className="text-[11px] text-slate-400">
                  Chọn &quot;Gộp thêm&quot; để bổ sung các thực thể mới vào đồ thị hiện tại mà không làm mất dữ liệu cũ.
                </div>
              </div>

              <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    importMode === 'merge'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Gộp thêm (Merge)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    importMode === 'replace'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ghi đè (Replace All)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Full Current Graph JSON Viewer */}
        {activeTab === 'view' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-3">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Mã JSON đầy đủ của bản nháp đồ thị hiện tại trên canvas:</span>
              <span className="font-mono text-[11px] text-slate-500">
                {currentGraphText.length} bytes
              </span>
            </div>
            <textarea
              readOnly
              value={currentGraphText}
              rows={18}
              spellCheck={false}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 focus:outline-none resize-none shadow-inner select-text"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Đóng
          </button>

          {activeTab === 'insert' && (
            <button
              type="button"
              disabled={!editable || !validation.isValid || validation.entitiesCount === 0}
              onClick={handleExecuteInsert}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">hub</span>
              <span>Chèn vào đồ thị &amp; Render ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
