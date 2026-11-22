'use client';

import React, { useState, useEffect } from 'react';
import { useCloConcepts, useUpdateCloConcepts } from '../hooks/useOutcomes';
import type { Clo, CloConcept } from '../schemas/clo.schema';

interface CloConceptMappingDrawerProps {
  courseId: string;
  clo: Clo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CloConceptMappingDrawer({
  courseId,
  clo,
  isOpen,
  onClose,
}: CloConceptMappingDrawerProps) {
  const [concepts, setConcepts] = useState<CloConcept[]>([]);
  const [newConceptId, setNewConceptId] = useState('');
  const [newConceptName, setNewConceptName] = useState('');
  const [newWeight, setNewWeight] = useState(1.0);

  const { data: remoteConcepts, isLoading } = useCloConcepts(
    courseId,
    clo?.id || ''
  );
  const updateMutation = useUpdateCloConcepts(courseId, clo?.id || '');

  useEffect(() => {
    if (remoteConcepts) {
      setConcepts(remoteConcepts);
    }
  }, [remoteConcepts]);

  if (!isOpen || !clo) return null;

  const handleWeightChange = (index: number, val: number) => {
    setConcepts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, weight: val } : c))
    );
  };

  const handleRemoveConcept = (conceptId: string) => {
    setConcepts((prev) => prev.filter((c) => c.conceptId !== conceptId));
  };

  const handleAddConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConceptName.trim()) return;

    const id = newConceptId.trim() || `concept_${Date.now()}`;
    if (concepts.some((c) => c.conceptId === id)) return;

    setConcepts((prev) => [
      ...prev,
      { conceptId: id, conceptName: newConceptName.trim(), weight: newWeight },
    ]);
    setNewConceptId('');
    setNewConceptName('');
    setNewWeight(1.0);
  };

  const handleSave = () => {
    updateMutation.mutate(
      { concepts },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-[#333537] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#282A2C] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]">
                {clo.code}
              </span>
              <span className="text-xs text-slate-500">Mức: {clo.bloomLevel}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3] mt-1 line-clamp-1">
              Gán Khái niệm vào {clo.code}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {clo.description}
          </p>

          {/* Form add new concept */}
          <form
            onSubmit={handleAddConcept}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#282A2C]/60 border border-slate-200/80 dark:border-[#383A3D] space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-800 dark:text-[#E3E3E3] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-500">
                add_circle
              </span>
              Thêm khái niệm kiến thức
            </h4>

            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Tên Khái niệm (Concept Name) *
              </label>
              <input
                type="text"
                placeholder="VD: Cây nhị phân tìm kiếm (BST)..."
                value={newConceptName}
                onChange={(e) => setNewConceptName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#383A3D] text-slate-800 dark:text-[#E3E3E3] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  Trọng số đóng góp (Weight):
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {(newWeight * 100).toFixed(0)}% ({newWeight.toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!newConceptName.trim()}
              className="w-full py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              + Gán vào CLO
            </button>
          </form>

          {/* List of mapped concepts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-[#E3E3E3]">
              Các khái niệm đã gán ({concepts.length})
            </h4>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Đang nạp danh sách khái niệm...
              </div>
            ) : concepts.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400 italic">
                Chưa có khái niệm nào được gán vào CLO này.
              </p>
            ) : (
              <div className="space-y-2">
                {concepts.map((concept, idx) => (
                  <div
                    key={concept.conceptId}
                    className="p-3 rounded-2xl bg-white dark:bg-[#282A2C] border border-slate-200/80 dark:border-[#383A3D] shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 dark:text-[#E3E3E3]">
                        {concept.conceptName}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveConcept(concept.conceptId)}
                        className="p-1 rounded-full text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Xóa khái niệm"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                        <span>Trọng số:</span>
                        <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                          {(concept.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={concept.weight}
                        onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#282A2C] flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-[#1A1A1B]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#282A2C] transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0B57D0] hover:bg-[#0842A0] text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
