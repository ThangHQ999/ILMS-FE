'use client';

import React, { useState } from 'react';
import {
  useClassOutcomeAttainment,
  useRecalculateOutcomeAttainment,
} from '../hooks/useOutcomes';
import type { AttainmentStatus } from '../schemas/outcome-attainment.schema';
import type { BloomLevel } from '../schemas/plo.schema';
import { CloPloMatrixTable } from './CloPloMatrixTable';

interface OutcomeAttainmentDashboardProps {
  classId: string;
  courseId: string;
  isTeacher?: boolean;
}

const BLOOM_COLORS: Record<BloomLevel, { bg: string; text: string; label: string }> = {
  REMEMBER: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', label: 'Nhớ (L1)' },
  UNDERSTAND: { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', label: 'Hiểu (L2)' },
  APPLY: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', label: 'Vận dụng (L3)' },
  ANALYZE: { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', label: 'Phân tích (L4)' },
  EVALUATE: { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', label: 'Đánh giá (L5)' },
  CREATE: { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', label: 'Sáng tạo (L6)' },
};

const STATUS_CONFIG: Record<AttainmentStatus, { bg: string; text: string; label: string; icon: string }> = {
  EXCEEDED: {
    bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    label: 'Vượt chuẩn',
    icon: 'stars',
  },
  MET: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    label: 'Đạt chuẩn',
    icon: 'check_circle',
  },
  APPROACHING: {
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'Tiệm cận',
    icon: 'trending_up',
  },
  BELOW: {
    bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
    label: 'Chưa đạt',
    icon: 'warning',
  },
  NOT_ASSESSED: {
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
    label: 'Chưa đánh giá',
    icon: 'schedule',
  },
};

export function OutcomeAttainmentDashboard({
  classId,
  courseId,
  isTeacher = true,
}: OutcomeAttainmentDashboardProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useClassOutcomeAttainment(
    classId,
    courseId
  );
  const recalculateMutation = useRecalculateOutcomeAttainment(classId, courseId);

  const [activeTab, setActiveTab] = useState<'clo' | 'plo'>('clo');
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-[#E1E5EA] dark:bg-[#282A2C]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C]" />
          <div className="h-24 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C]" />
          <div className="h-24 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C]" />
          <div className="h-24 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C]" />
        </div>
        <div className="h-80 rounded-3xl bg-[#E1E5EA] dark:bg-[#282A2C]" />
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#1E1F20] text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">error_outline</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Không thể tải dữ liệu đạt chuẩn đầu ra
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            {(error as Error)?.message || 'Vui lòng kiểm tra kết nối mạng hoặc thử lại.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const clos = data.cloAttainments || [];
  const plos = data.ploSummaries || [];

  // Metrics calculation
  const totalClos = clos.length;
  const metClos = clos.filter((c) => c.status === 'MET' || c.status === 'EXCEEDED').length;
  const avgAttainmentRate =
    totalClos > 0
      ? Math.round(clos.reduce((sum, c) => sum + c.attainmentRate, 0) / totalClos)
      : 0;
  const belowClos = clos.filter((c) => c.status === 'BELOW').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              Outcome Attainment
            </span>
            {isFetching && !isLoading && (
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 animate-spin">
                <span className="material-symbols-outlined text-[14px]">sync</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            Báo cáo Đạt Chuẩn Đầu Ra (CLO &amp; PLO)
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Lớp: <strong className="text-gray-800 dark:text-gray-200">{data.className || classId}</strong>
            {data.courseName && (
              <span> &bull; Môn học: <strong className="text-gray-800 dark:text-gray-200">{data.courseName}</strong></span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isTeacher && (
            <>
              <button
                type="button"
                onClick={() => setShowMatrixModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#282A2C] transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-blue-500">grid_on</span>
                <span>Ma trận ánh xạ CLO-PLO</span>
              </button>

              <button
                type="button"
                disabled={recalculateMutation.isPending}
                onClick={() => recalculateMutation.mutate()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                <span
                  className={`material-symbols-outlined text-[17px] ${
                    recalculateMutation.isPending ? 'animate-spin' : ''
                  }`}
                >
                  refresh
                </span>
                <span>{recalculateMutation.isPending ? 'Đang tính toán...' : 'Tính lại chuẩn đầu ra'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tỷ lệ đạt chuẩn TB */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tỷ lệ đạt chuẩn TB</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {avgAttainmentRate}%
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Mục tiêu tối thiểu: &ge; 70%
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        {/* KPI 2: Số CLO Đạt */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">CLO Đạt &amp; Vượt chuẩn</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {metClos} / {totalClos}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {totalClos > 0 ? `${Math.round((metClos / totalClos) * 100)}% CLO hoàn thành` : 'Chưa có CLO'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
        </div>

        {/* KPI 3: CLO Cần can thiệp */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">CLO Cần cải thiện</p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {belowClos}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {belowClos > 0 ? 'Dưới ngưỡng đạt chuẩn' : 'Không có CLO bị hổng'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
        </div>

        {/* KPI 4: PLO Chương trình liên kết */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">PLO Chương trình</p>
            <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {plos.length}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Chuẩn đầu ra cấp khoa/ngành
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
        </div>
      </div>

      {/* 3. Tab switcher: CLO Details vs PLO Summary */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('clo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border-none ${
            activeTab === 'clo'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282A2C]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">checklist</span>
          <span>Chi tiết CLO Môn học ({totalClos})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border-none ${
            activeTab === 'plo'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282A2C]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">hub</span>
          <span>Tổng hợp PLO Chương trình ({plos.length})</span>
        </button>
      </div>

      {/* 4. Tab Content: CLO Details */}
      {activeTab === 'clo' && (
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none overflow-hidden">
          {clos.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">
                assignment_late
              </span>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Chưa có dữ liệu đánh giá CLO cho môn học này
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Vui lòng cấu hình chuẩn CLO và tính toán lại sau khi học viên nộp bài kiểm tra.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Mã &amp; Tên CLO</th>
                    <th className="py-3 px-3 text-center">Cấp độ Bloom</th>
                    <th className="py-3 px-3 text-center">Ngưỡng đạt</th>
                    <th className="py-3 px-3 text-center">Điểm TB cả lớp</th>
                    <th className="py-3 px-3 min-w-[180px]">Tỷ lệ đạt chuẩn (%)</th>
                    <th className="py-3 px-3 text-center">Số SV Đạt</th>
                    <th className="py-3 px-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                  {clos.map((clo) => {
                    const bloom = BLOOM_COLORS[clo.bloomLevel] || BLOOM_COLORS.APPLY;
                    const status = STATUS_CONFIG[clo.status] || STATUS_CONFIG.NOT_ASSESSED;
                    return (
                      <tr
                        key={clo.cloId}
                        className="hover:bg-gray-50/80 dark:hover:bg-[#282A2C]/60 transition"
                      >
                        <td className="py-4 px-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex flex-col">
                            <span className="font-mono text-blue-600 dark:text-blue-400 text-sm font-bold">
                              {clo.cloCode}
                            </span>
                            {clo.cloName && (
                              <span className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1">
                                {clo.cloName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${bloom.bg} ${bloom.text}`}
                          >
                            {bloom.label}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center font-mono font-medium text-gray-700 dark:text-gray-300">
                          {clo.targetScore.toFixed(1)} / 100
                        </td>
                        <td className="py-4 px-3 text-center font-mono font-bold text-gray-900 dark:text-gray-100">
                          {clo.averageAttainmentScore.toFixed(1)}
                        </td>
                        <td className="py-4 px-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="font-bold text-gray-800 dark:text-gray-200">
                                {clo.attainmentRate}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  clo.status === 'EXCEEDED'
                                    ? 'bg-purple-500'
                                    : clo.status === 'MET'
                                    ? 'bg-emerald-500'
                                    : clo.status === 'APPROACHING'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, clo.attainmentRate))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center font-mono text-gray-700 dark:text-gray-300">
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {clo.studentsMetCount}
                          </span>
                          <span className="text-gray-400"> / {data.totalStudents} SV</span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${status.bg} ${status.text}`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {status.icon}
                            </span>
                            <span>{status.label}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab Content: PLO Summary */}
      {activeTab === 'plo' && (
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none overflow-hidden">
          {plos.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">
                hub
              </span>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Chưa có chuẩn PLO nào được ánh xạ tới môn học này
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Sử dụng ma trận ánh xạ CLO-PLO để liên kết các chuẩn đầu ra môn học với chuẩn chương trình đào tạo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plos.map((plo) => {
                const status = STATUS_CONFIG[plo.status] || STATUS_CONFIG.NOT_ASSESSED;
                return (
                  <div
                    key={plo.ploId}
                    className="p-5 rounded-2xl bg-gray-50/70 dark:bg-[#282A2C]/50 border border-gray-100 dark:border-gray-800 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                          {plo.ploCode}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                          {plo.ploName || 'Chuẩn đầu ra chương trình'}
                        </h4>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg} ${status.text}`}
                      >
                        <span className="material-symbols-outlined text-[12px]">{status.icon}</span>
                        <span>{status.label}</span>
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Điểm TB tích lũy:</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                          {plo.averageAttainmentScore.toFixed(1)} / 100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Ngưỡng chuẩn tối thiểu:</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300">
                          {plo.targetScore.toFixed(1)} / 100
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Modal: Ma trận ánh xạ CLO-PLO */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                  grid_on
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Cấu hình Ma trận Ánh xạ CLO - PLO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <CloPloMatrixTable courseId={courseId} isTeacher={isTeacher} />
          </div>
        </div>
      )}
    </div>
  );
}
