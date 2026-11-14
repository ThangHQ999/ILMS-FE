'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CourseMaterialsTabProps {
  courseName: string;
  onShowToast: (msg: string) => void;
}

interface MaterialItem {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'slide' | 'archive';
  fileSize: string;
  uploadedAt: string;
  isAiIndexed: boolean;
  conceptsCount: number;
}

const MOCK_MATERIALS: MaterialItem[] = [
  {
    id: 'mat-01',
    title: 'GiaoTrinh_CauTrucDuLieu_GiaiThuat_NangCao_2024.pdf',
    type: 'pdf',
    fileSize: '14.8 MB',
    uploadedAt: '12/10/2024',
    isAiIndexed: true,
    conceptsCount: 64,
  },
  {
    id: 'mat-02',
    title: 'Slide_BaiGiang_Chuong1_den_Chuong4_Full.pdf',
    type: 'slide',
    fileSize: '8.2 MB',
    uploadedAt: '18/10/2024',
    isAiIndexed: true,
    conceptsCount: 42,
  },
  {
    id: 'mat-03',
    title: 'Code_Mau_CPlusPlus_AVL_SegmentTree_Dijkstra.zip',
    type: 'code',
    fileSize: '1.2 MB',
    uploadedAt: '25/10/2024',
    isAiIndexed: true,
    conceptsCount: 18,
  },
  {
    id: 'mat-04',
    title: 'De_Cuong_Chi_Tiet_Hoc_Phan_ABET.pdf',
    type: 'pdf',
    fileSize: '650 KB',
    uploadedAt: '01/09/2024',
    isAiIndexed: false,
    conceptsCount: 8,
  },
];

export function CourseMaterialsTab({ courseName, onShowToast }: CourseMaterialsTabProps) {
  const t = useTranslations('courses.detail');
  const [materials, setMaterials] = useState<MaterialItem[]>(MOCK_MATERIALS);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleAiExtract = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      setMaterials((prev) =>
        prev.map((m) => ({ ...m, isAiIndexed: true, conceptsCount: m.conceptsCount + 6 }))
      );
      onShowToast('Hệ thống AI đã hoàn tất bóc tách 18 khái niệm tri thức mới từ tài liệu!');
    }, 1500);
  };

  const getFileIcon = (type: MaterialItem['type']) => {
    switch (type) {
      case 'slide':
        return { icon: 'co_present', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' };
      case 'code':
        return { icon: 'code', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' };
      case 'archive':
        return { icon: 'folder_zip', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50' };
      case 'pdf':
      default:
        return { icon: 'picture_as_pdf', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50' };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            {t('materialsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('materialsDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAiExtract}
            disabled={isExtracting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-xs font-bold transition-all disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isExtracting ? 'animate-spin' : ''}`}>
              {isExtracting ? 'sync' : 'auto_awesome'}
            </span>
            <span>{isExtracting ? 'Đang bóc tách...' : t('btnAiExtract')}</span>
          </button>

          <button
            type="button"
            onClick={() => onShowToast('Mở hộp thoại tải lên tài liệu môn học...')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>{t('btnUploadMaterial')}</span>
          </button>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((mat) => {
          const icon = getFileIcon(mat.type);

          return (
            <div
              key={mat.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-[3px] border-slate-300 dark:border-slate-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${icon.color} group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-outlined text-[22px]">{icon.icon}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {mat.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{mat.fileSize}</span>
                    <span>•</span>
                    <span>{mat.uploadedAt}</span>
                    {mat.isAiIndexed && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                          <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                          <span>{mat.conceptsCount} khái niệm AI</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-400">
                  {mat.isAiIndexed ? 'Đã lập chỉ mục Socratic' : 'Chờ lập chỉ mục'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onShowToast(`Xem trước tài liệu "${mat.title}"`)}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Xem trước"
                  >
                    <span className="material-symbols-outlined text-[17px]">visibility</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast(`Tải xuống "${mat.title}"`)}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Tải xuống"
                  >
                    <span className="material-symbols-outlined text-[17px]">download</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

