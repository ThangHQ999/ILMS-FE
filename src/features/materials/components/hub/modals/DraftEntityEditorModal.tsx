'use client';

import React, { useState } from 'react';
import type { DraftEntity } from '../../../utils/draft-graph-crud';

interface DraftEntityEditorModalProps {
  isOpen: boolean;
  entity: DraftEntity | null;
  entityIndex: number;
  onClose: () => void;
  onSave: (updated: DraftEntity) => void;
  onDelete: (index: number) => void;
}

export function DraftEntityEditorModal({
  isOpen,
  entity,
  entityIndex,
  onClose,
  onSave,
  onDelete,
}: DraftEntityEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'processes' | 'exercises' | 'examples' | 'arguments'>('info');

  // Basic info states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [definition, setDefinition] = useState('');
  const [error, setError] = useState('');

  // Sub-items states
  const [processes, setProcesses] = useState<DraftEntity['processes']>([]);
  const [exercises, setExercises] = useState<DraftEntity['exercises']>([]);
  const [examples, setExamples] = useState<DraftEntity['examples']>([]);
  const [argumentsList, setArgumentsList] = useState<DraftEntity['arguments']>([]);

  // Sub-item creation form states
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessDesc, setNewProcessDesc] = useState('');
  const [newProcessSteps, setNewProcessSteps] = useState('');

  const [newExerciseTitle, setNewExerciseTitle] = useState('');
  const [newExerciseContent, setNewExerciseContent] = useState('');

  const [newExampleTitle, setNewExampleTitle] = useState('');
  const [newExampleExp, setNewExampleExp] = useState('');
  const [newExampleCode, setNewExampleCode] = useState('');

  const [newArgHypo, setNewArgHypo] = useState('');
  const [newArgEvidence, setNewArgEvidence] = useState('');
  const [newArgConclusion, setNewArgConclusion] = useState('');

  React.useEffect(() => {
    if (entity) {
      setName(entity.name || '');
      setDescription(entity.description || '');
      const defContent =
        typeof entity.definition === 'string'
          ? entity.definition
          : entity.definition?.content || '';
      setDefinition(defContent);
      setProcesses(entity.processes ? structuredClone(entity.processes) : []);
      setExercises(entity.exercises ? structuredClone(entity.exercises) : []);
      setExamples(entity.examples ? structuredClone(entity.examples) : []);
      setArgumentsList(entity.arguments ? structuredClone(entity.arguments) : []);
    }
  }, [entity]);

  if (!isOpen || !entity) return null;

  const handleSaveAll = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setActiveTab('info');
      setError('Vui lòng nhập tên thực thể tri thức.');
      return;
    }
    const defTrimmed = definition.trim();
    if (!defTrimmed) {
      setActiveTab('info');
      setError('Định nghĩa cốt lõi (Definition) là bắt buộc. Vui lòng nhập nội dung định nghĩa.');
      return;
    }
    setError('');
    onSave({
      name: trimmed,
      description: description.trim(),
      definition: { content: defTrimmed },
      processes,
      exercises,
      examples,
      arguments: argumentsList,
    });
    onClose();
  };

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcessName.trim()) return;
    const steps = newProcessSteps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((action, idx) => ({ action, step_number: idx + 1 }));

    setProcesses((prev) => [
      ...(prev || []),
      {
        name: newProcessName.trim(),
        description: newProcessDesc.trim(),
        steps,
      },
    ]);
    setNewProcessName('');
    setNewProcessDesc('');
    setNewProcessSteps('');
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseTitle.trim()) return;
    setExercises((prev) => [
      ...(prev || []),
      {
        title: newExerciseTitle.trim(),
        content: newExerciseContent.trim(),
        steps: [],
      },
    ]);
    setNewExerciseTitle('');
    setNewExerciseContent('');
  };

  const handleAddExample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExampleTitle.trim()) return;
    setExamples((prev) => [
      ...(prev || []),
      {
        title: newExampleTitle.trim(),
        explanation: newExampleExp.trim(),
        code_snippet: newExampleCode.trim(),
      },
    ]);
    setNewExampleTitle('');
    setNewExampleExp('');
    setNewExampleCode('');
  };

  const handleAddArgument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArgHypo.trim()) return;
    setArgumentsList((prev) => [
      ...(prev || []),
      {
        hypothesis: newArgHypo.trim(),
        evidence: newArgEvidence.trim(),
        conclusion: newArgConclusion.trim(),
      },
    ]);
    setNewArgHypo('');
    setNewArgEvidence('');
    setNewArgConclusion('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center material-symbols-outlined text-[20px]">
              edit_note
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Chỉnh sửa Thực thể Tri thức
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Thực thể #{entityIndex + 1}: {entity.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Thông tin &amp; Định nghĩa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('processes')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'processes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Quy trình ({processes?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'exercises'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Bài tập ({exercises?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'examples'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ví dụ ({examples?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('arguments')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'arguments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lập luận ({argumentsList?.length || 0})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'info' && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên thực thể tri thức <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Định nghĩa cốt lõi (Definition) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={definition}
                  onChange={(e) => {
                    setDefinition(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Giải thích ngắn gọn bản chất khái niệm (Bắt buộc)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mô tả chi tiết / Bối cảnh
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          )}

          {activeTab === 'processes' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Danh sách quy trình hiện có ({processes?.length || 0})
                </h4>
                {(!processes || processes.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Chưa có quy trình nào.</p>
                ) : (
                  <div className="space-y-2">
                    {processes.map((proc, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {proc.name}
                          </span>
                          {proc.description && (
                            <p className="text-slate-500 dark:text-slate-400">{proc.description}</p>
                          )}
                          {proc.steps && proc.steps.length > 0 && (
                            <ol className="list-decimal pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                              {proc.steps.map((st, sIdx) => (
                                <li key={sIdx}>{st.action}</li>
                              ))}
                            </ol>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProcesses((prev) => prev?.filter((_, idx) => idx !== pIdx))
                          }
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Xóa quy trình này"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form add process */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  + Thêm quy trình mới
                </span>
                <input
                  type="text"
                  placeholder="Tên quy trình (VD: Quy trình mã hóa khóa công khai)..."
                  value={newProcessName}
                  onChange={(e) => setNewProcessName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Mô tả quy trình..."
                  value={newProcessDesc}
                  onChange={(e) => setNewProcessDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Các bước (mỗi dòng 1 bước)..."
                  value={newProcessSteps}
                  onChange={(e) => setNewProcessSteps(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddProcess}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </div>
          )}

          {activeTab === 'exercises' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Danh sách bài tập hiện có ({exercises?.length || 0})
                </h4>
                {(!exercises || exercises.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Chưa có bài tập nào.</p>
                ) : (
                  <div className="space-y-2">
                    {exercises.map((ex, eIdx) => (
                      <div
                        key={eIdx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {ex.title}
                          </span>
                          {ex.content && (
                            <p className="text-slate-600 dark:text-slate-300">{ex.content}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExercises((prev) => prev?.filter((_, idx) => idx !== eIdx))
                          }
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Xóa bài tập này"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form add exercise */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  + Thêm bài tập mới
                </span>
                <input
                  type="text"
                  placeholder="Tiêu đề bài tập..."
                  value={newExerciseTitle}
                  onChange={(e) => setNewExerciseTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Nội dung đề bài / Yêu cầu..."
                  value={newExerciseContent}
                  onChange={(e) => setNewExerciseContent(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Danh sách ví dụ minh họa ({examples?.length || 0})
                </h4>
                {(!examples || examples.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Chưa có ví dụ nào.</p>
                ) : (
                  <div className="space-y-2">
                    {examples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {ex.title}
                          </span>
                          {ex.explanation && (
                            <p className="text-slate-600 dark:text-slate-300">{ex.explanation}</p>
                          )}
                          {ex.code_snippet && (
                            <pre className="p-2 rounded bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                              {ex.code_snippet}
                            </pre>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExamples((prev) => prev?.filter((_, idx) => idx !== exIdx))
                          }
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Xóa ví dụ này"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form add example */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  + Thêm ví dụ minh họa
                </span>
                <input
                  type="text"
                  placeholder="Tiêu đề ví dụ..."
                  value={newExampleTitle}
                  onChange={(e) => setNewExampleTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Giải thích chi tiết ví dụ..."
                  value={newExampleExp}
                  onChange={(e) => setNewExampleExp(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Đoạn mã code / minh họa (nếu có)..."
                  value={newExampleCode}
                  onChange={(e) => setNewExampleCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddExample}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </div>
          )}

          {activeTab === 'arguments' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Danh sách lập luận ({argumentsList?.length || 0})
                </h4>
                {(!argumentsList || argumentsList.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Chưa có lập luận nào.</p>
                ) : (
                  <div className="space-y-2">
                    {argumentsList.map((arg, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            Giả thuyết: {arg.hypothesis}
                          </span>
                          {arg.evidence && (
                            <p className="text-slate-600 dark:text-slate-300">Bằng chứng: {arg.evidence}</p>
                          )}
                          {arg.conclusion && (
                            <p className="text-slate-700 dark:text-slate-200 font-semibold">
                              Kết luận: {arg.conclusion}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setArgumentsList((prev) => prev?.filter((_, idx) => idx !== aIdx))
                          }
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Xóa lập luận này"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form add argument */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  + Thêm lập luận mới
                </span>
                <input
                  type="text"
                  placeholder="Giả thuyết (Hypothesis)..."
                  value={newArgHypo}
                  onChange={(e) => setNewArgHypo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Bằng chứng chứng minh..."
                  value={newArgEvidence}
                  onChange={(e) => setNewArgEvidence(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <input
                  type="text"
                  placeholder="Kết luận rút ra..."
                  value={newArgConclusion}
                  onChange={(e) => setNewArgConclusion(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddArgument}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Bạn có chắc chắn muốn xóa thực thể "${entity.name}" và toàn bộ liên kết liên quan?`)) {
                onDelete(entityIndex);
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">delete_forever</span>
            <span>Xóa thực thể này</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={!name.trim() || !definition.trim()}
              className="px-5 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-opacity"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
