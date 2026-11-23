'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useClos,
  usePlos,
  useCloPloMatrix,
  useUpdateCloPloMatrix,
  useCreateClo,
  useCreatePlo,
} from '../hooks/useOutcomes';
import { CloConceptMappingDrawer } from './CloConceptMappingDrawer';
import type { Clo, ContributionLevel, CloPloMappingItem } from '../schemas/clo.schema';
import type { BloomLevel } from '../schemas/plo.schema';

interface CloPloMatrixTableProps {
  courseId: string;
  courseTitle?: string;
  isTeacher?: boolean;
}

export function CloPloMatrixTable({
  courseId,
  courseTitle,
  isTeacher = true,
}: CloPloMatrixTableProps) {
  const { data: clos, isLoading: isClosLoading, refetch: refetchClos } = useClos(courseId);
  const { data: plosData, isLoading: isPlosLoading, refetch: refetchPlos } = usePlos();
  const { data: matrixData, isLoading: isMatrixLoading } = useCloPloMatrix(courseId);

  const updateMatrixMutation = useUpdateCloPloMatrix(courseId);
  const createCloMutation = useCreateClo(courseId);
  const createPloMutation = useCreatePlo();

  // Local matrix state for batch editing: `${cloId}_${ploId}` -> ContributionLevel | null
  const [localMappings, setLocalMappings] = useState<Record<string, ContributionLevel | null>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Drawer & Modal state
  const [mappingClo, setMappingClo] = useState<Clo | null>(null);
  const [isAddCloOpen, setIsAddCloOpen] = useState(false);
  const [isAddPloOpen, setIsAddPloOpen] = useState(false);

  // Form states for CLO & PLO creation
  const [newCloCode, setNewCloCode] = useState('');
  const [newCloDesc, setNewCloDesc] = useState('');
  const [newCloBloom, setNewCloBloom] = useState<BloomLevel>('APPLY');

  const [newPloCode, setNewPloCode] = useState('');
  const [newPloDesc, setNewPloDesc] = useState('');
  const [newPloBloom, setNewPloBloom] = useState<BloomLevel>('APPLY');

  const plos = useMemo(() => plosData?.items || [], [plosData]);

  // Sync server matrix data to local state
  useEffect(() => {
    if (matrixData?.mappings) {
      const map: Record<string, ContributionLevel | null> = {};
      matrixData.mappings.forEach((m) => {
        map[`${m.cloId}_${m.ploId}`] = m.contributionLevel;
      });
      setLocalMappings(map);
      setHasChanges(false);
    }
  }, [matrixData]);

  // Cell Click: Cycle None -> HIGH -> MEDIUM -> LOW -> None
  const handleCellClick = (cloId: string, ploId: string) => {
    const key = `${cloId}_${ploId}`;
    const current = localMappings[key];
    let next: ContributionLevel | null = null;

    if (!current) next = 'HIGH';
    else if (current === 'HIGH') next = 'MEDIUM';
    else if (current === 'MEDIUM') next = 'LOW';
    else next = null;

    setLocalMappings((prev) => ({ ...prev, [key]: next }));
    setHasChanges(true);
  };

  const handleSaveMatrix = () => {
    const mappings: CloPloMappingItem[] = [];
    Object.entries(localMappings).forEach(([key, level]) => {
      if (level) {
        const [cloId, ploId] = key.split('_');
        mappings.push({ cloId, ploId, contributionLevel: level });
      }
    });

    updateMatrixMutation.mutate(
      { mappings },
      {
        onSuccess: () => {
          setHasChanges(false);
        },
      }
    );
  };

  const handleCreateCloSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCloCode.trim() || !newCloDesc.trim()) return;

    createCloMutation.mutate(
      {
        code: newCloCode.trim(),
        description: newCloDesc.trim(),
        bloomLevel: newCloBloom,
        orderIndex: (clos?.length || 0) + 1,
      },
      {
        onSuccess: () => {
          setIsAddCloOpen(false);
          setNewCloCode('');
          setNewCloDesc('');
          refetchClos();
        },
      }
    );
  };

  const handleCreatePloSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPloCode.trim() || !newPloDesc.trim()) return;

    createPloMutation.mutate(
      {
        code: newPloCode.trim(),
        description: newPloDesc.trim(),
        bloomLevel: newPloBloom,
        orderIndex: plos.length + 1,
      },
      {
        onSuccess: () => {
          setIsAddPloOpen(false);
          setNewPloCode('');
          setNewPloDesc('');
          refetchPlos();
        },
      }
    );
  };

  const renderBadge = (level?: ContributionLevel | null) => {
    if (!level) {
      return (
        <span className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          •
        </span>
      );
    }
    if (level === 'HIGH') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border border-blue-300/80 dark:border-blue-800">
          H (★★★)
        </span>
      );
    }
    if (level === 'MEDIUM') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800">
          M (★★)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800">
        L (★)
      </span>
    );
  };

  const isLoading = isClosLoading || isPlosLoading || isMatrixLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-[#1E1F20] rounded-2xl w-64" />
        <div className="h-80 bg-white dark:bg-[#1E1F20] rounded-3xl border border-slate-200 dark:border-[#333537]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]">
              {courseTitle || 'Môn học'}
            </span>
            <span className="text-xs text-slate-500">
              {clos?.length || 0} CLO • {plos.length} PLO
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#E3E3E3] mt-1">
            Ma trận Ánh xạ 2 chiều Chuẩn đầu ra (CLO – PLO Matrix)
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Add CLO Button */}
          <button
            type="button"
            onClick={() => setIsAddCloOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#1E1F20] text-slate-700 dark:text-[#E3E3E3] border border-slate-200 dark:border-[#383A3D] hover:bg-slate-50 dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
          >
            + Thêm CLO
          </button>

          {/* Add PLO Button */}
          <button
            type="button"
            onClick={() => setIsAddPloOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#1E1F20] text-slate-700 dark:text-[#E3E3E3] border border-slate-200 dark:border-[#383A3D] hover:bg-slate-50 dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
          >
            + Thêm PLO
          </button>

          {/* Save Matrix Button */}
          <button
            type="button"
            onClick={handleSaveMatrix}
            disabled={!hasChanges || updateMatrixMutation.isPending}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>{updateMatrixMutation.isPending ? 'Đang lưu...' : 'Lưu ma trận'}</span>
          </button>
        </div>
      </div>

      {/* Legend & Guide */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Mức độ đóng góp:
          </span>
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              H (High)
            </span>
            <span className="text-slate-500">Trọng số 3</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              M (Medium)
            </span>
            <span className="text-slate-500">Trọng số 2</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              L (Low)
            </span>
            <span className="text-slate-500">Trọng số 1</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          * Bấm trực tiếp vào ô để chuyển đổi mức đóng góp
        </p>
      </div>

      {/* 2D Matrix Table */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-3.5 sm:p-5 shadow-sm border border-slate-200/80 dark:border-[#333537] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[620px] sm:min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#282A2C] text-xs font-bold text-slate-600 dark:text-slate-300">
              <th className="py-3 px-3 sm:px-4 min-w-[130px] sm:min-w-[220px] max-w-[160px] sm:max-w-[260px] sticky left-0 bg-white dark:bg-[#1E1F20] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                Chuẩn đầu ra (CLO)
              </th>
              {plos.map((plo) => (
                <th
                  key={plo.id}
                  className="py-3 px-1.5 sm:px-2 text-center min-w-[70px] sm:min-w-[100px] max-w-[140px]"
                  title={plo.description}
                >
                  <p className="font-bold text-slate-800 dark:text-[#E3E3E3] text-xs">
                    {plo.code}
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal">
                    {plo.bloomLevel}
                  </p>
                </th>
              ))}
              <th className="py-3 px-2 sm:px-3 text-right min-w-[90px] sm:min-w-[130px]">
                Gán tri thức
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#282A2C]/60 text-xs">
            {!clos || clos.length === 0 ? (
              <tr>
                <td
                  colSpan={plos.length + 2}
                  className="py-12 text-center text-slate-400 text-xs"
                >
                  Môn học chưa có chuẩn đầu ra CLO nào. Bấm &quot;+ Thêm CLO&quot; để bắt đầu.
                </td>
              </tr>
            ) : (
              clos.map((clo) => (
                <tr
                  key={clo.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#282A2C]/50 transition-colors"
                >
                  <td className="py-3 px-3 sm:px-4 min-w-[130px] sm:min-w-[220px] max-w-[160px] sm:max-w-[260px] sticky left-0 bg-white dark:bg-[#1E1F20] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                        {clo.code}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {clo.bloomLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1 sm:line-clamp-2">
                      {clo.description}
                    </p>
                  </td>

                  {plos.map((plo) => {
                    const key = `${clo.id}_${plo.id}`;
                    const level = localMappings[key];
                    return (
                      <td
                        key={plo.id}
                        className="py-3 px-1.5 sm:px-2 text-center align-middle cursor-pointer"
                        onClick={() => handleCellClick(clo.id, plo.id)}
                      >
                        {renderBadge(level)}
                      </td>
                    );
                  })}

                  <td className="py-3 px-2 sm:px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setMappingClo(clo)}
                      className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] hover:opacity-90 transition-all cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-[15px]">account_tree</span>
                      <span className="hidden sm:inline">Gán Concepts</span>
                      <span className="sm:hidden">Gán</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer: Map Concepts to CLO */}
      <CloConceptMappingDrawer
        courseId={courseId}
        clo={mappingClo}
        isOpen={Boolean(mappingClo)}
        onClose={() => setMappingClo(null)}
      />

      {/* Modal: Create CLO */}
      {isAddCloOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-[#333537]">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#E3E3E3]">
              Thêm Chuẩn đầu ra Môn học (CLO)
            </h3>
            <form onSubmit={handleCreateCloSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mã CLO * (VD: CLO-01)
                </label>
                <input
                  type="text"
                  placeholder="CLO-01"
                  value={newCloCode}
                  onChange={(e) => setNewCloCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-[#383A3D] text-slate-800 dark:text-[#E3E3E3]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mức Bloom *
                </label>
                <select
                  value={newCloBloom}
                  onChange={(e) => setNewCloBloom(e.target.value as BloomLevel)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-[#383A3D] text-slate-800 dark:text-[#E3E3E3]"
                >
                  <option value="REMEMBER">Nhớ (REMEMBER)</option>
                  <option value="UNDERSTAND">Hiểu (UNDERSTAND)</option>
                  <option value="APPLY">Vận dụng (APPLY)</option>
                  <option value="ANALYZE">Phân tích (ANALYZE)</option>
                  <option value="EVALUATE">Đánh giá (EVALUATE)</option>
                  <option value="CREATE">Sáng tạo (CREATE)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mô tả chuẩn đầu ra *
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả kỹ năng hoặc năng lực sinh viên cần đạt được..."
                  value={newCloDesc}
                  onChange={(e) => setNewCloDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-[#383A3D] text-slate-800 dark:text-[#E3E3E3]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCloOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282A2C]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createCloMutation.isPending}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createCloMutation.isPending ? 'Đang tạo...' : 'Tạo CLO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create PLO */}
      {isAddPloOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-[#333537]">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#E3E3E3]">
              Thêm Chuẩn đầu ra Chương trình (PLO)
            </h3>
            <form onSubmit={handleCreatePloSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mã PLO * (VD: PLO-01)
                </label>
                <input
                  type="text"
                  placeholder="PLO-01"
                  value={newPloCode}
                  onChange={(e) => setNewPloCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-[#383A3D] text-slate-800 dark:text-[#E3E3E3]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mức Bloom *
                </label>
                <select
                  value={newPloBloom}
                  onChange={(e) => setNewPloBloom(e.target.value as BloomLevel)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-[#383A3D] text-slate-800 dark:text-[#E3E3E3]"
                >
                  <option value="REMEMBER">Nhớ (REMEMBER)</option>
                  <option value="UNDERSTAND">Hiểu (UNDERSTAND)</option>
                  <option value="APPLY">Vận dụng (APPLY)</option>
                  <option value="ANALYZE">Phân tích (ANALYZE)</option>
                  <option value="EVALUATE">Đánh giá (EVALUATE)</option>
                  <option value="CREATE">Sáng tạo (CREATE)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mô tả chuẩn đầu ra chương trình *
                </label>
                <textarea
                  rows={3}
                  placeholder="Khả năng áp dụng kiến thức nền tảng và chuyên sâu..."
                  value={newPloDesc}
                  onChange={(e) => setNewPloDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#282A2C] border border-slate-200 dark:border-[#383A3D] text-slate-800 dark:text-[#E3E3E3]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPloOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282A2C]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createPloMutation.isPending}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createPloMutation.isPending ? 'Đang tạo...' : 'Tạo PLO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
