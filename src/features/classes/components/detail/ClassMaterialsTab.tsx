'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ClassMaterial } from '../../schemas/class-detail.schema';
import { UploadMaterialModal } from './UploadMaterialModal';

interface ClassMaterialsTabProps {
  materials?: ClassMaterial[];
  currentRole?: 'owner' | 'teacher' | 'student';
  onToast?: (message: string) => void;
}

export function ClassMaterialsTab({
  materials: initialMaterials = [],
  currentRole = 'owner',
  onToast,
}: ClassMaterialsTabProps) {
  const t = useTranslations('classes.detail');

  // Filter & Search states
  const [materials, setMaterials] = useState<ClassMaterial[]>(initialMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [isUploadAiModalOpen, setIsUploadAiModalOpen] = useState(false);
  const [isAutoQuizOpen, setIsAutoQuizOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<ClassMaterial | null>(null);

  // Internal toast helper
  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  // Filtered & Sorted items
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((item) => {
        const matchesQuery =
          !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.subDetail && item.subDetail.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSubject =
          selectedSubject === 'ALL' || item.subjectCode === selectedSubject;

        const matchesCategory =
          selectedCategory === 'ALL' || item.categoryType === selectedCategory;

        return matchesQuery && matchesSubject && matchesCategory;
      })
      .sort((a, b) => {
        // Pinned items first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
  }, [materials, searchQuery, selectedSubject, selectedCategory]);

  const handleTogglePin = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextPinned = !m.isPinned;
          notify(
            nextPinned
              ? `Đã ghim "${m.filename}" lên đầu danh sách.`
              : `Đã bỏ ghim "${m.filename}".`
          );
          return { ...m, isPinned: nextPinned };
        }
        return m;
      })
    );
    setActiveMenuId(null);
  };

  const handleDownload = (material: ClassMaterial) => {
    notify(t('toastDownloaded', { name: material.filename }));
  };

  const handleOpenGraph = (material?: ClassMaterial) => {
    setSelectedMaterial(material || materials[0] || null);
    setIsGraphOpen(true);
  };

  const handleOpenAutoQuiz = (material?: ClassMaterial) => {
    setSelectedMaterial(material || materials[1] || materials[0] || null);
    setIsAutoQuizOpen(true);
  };

  // Helper for format icons & colors
  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'PDF':
        return {
          icon: 'picture_as_pdf',
          bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        };
      case 'PPTX':
        return {
          icon: 'slideshow',
          bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        };
      case 'QUIZ':
        return {
          icon: 'quiz',
          bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        };
      case 'CODE':
        return {
          icon: 'folder_zip',
          bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        };
      default:
        return {
          icon: 'description',
          bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-xs border border-blue-100 dark:border-blue-900/50">
            <span className="material-symbols-outlined text-[22px]">folder_open</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
                {t('materialsTitle')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                {t('materialsRepositoryBadge')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {t('materialsDesc')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/materials/tasks"
            className="h-9 px-3.5 rounded-full font-semibold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all inline-flex items-center gap-1.5 whitespace-nowrap border border-slate-200/80 dark:border-slate-700 shadow-xs active:scale-95"
            title="Quản lý tiến trình xử lý ngầm (Background AI Queue)"
          >
            <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400">
              assignment
            </span>
            <span>Hàng đợi AI</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              2
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsUploadAiModalOpen(true)}
            className="h-9 px-3.5 rounded-full font-semibold text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px] text-indigo-600 dark:text-indigo-400">
              auto_awesome
            </span>
            <span>{t('btnAiScan')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="h-9 px-4 rounded-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">upload_file</span>
            <span>+ {t('btnUploadMaterial')}</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Storage */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('kpiStorage')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">cloud</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              1.4 GB
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 10 GB (14%)</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: '14%' }}
            />
          </div>
        </div>

        {/* KPI 2: Uploaded count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('kpiUploaded')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              38
            </span>
            <span className="text-xs font-semibold text-slate-400">tài liệu số</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t('kpiUploadedNote')}</span>
          </div>
        </div>

        {/* KPI 3: Subject Allocation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('kpiSubjects')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">library_books</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              4 / 4
            </span>
            <span className="text-xs font-semibold text-slate-400">môn học</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              100% môn có giáo trình
            </span>
            <span className="text-[11px] text-slate-400">Kỳ 1</span>
          </div>
        </div>

        {/* KPI 4: AI Extraction */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              {t('kpiAiExtract')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              98%
            </span>
            <span className="text-xs font-semibold text-slate-400">(37/38 tài liệu)</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            <span>{t('kpiAiExtractNote')}</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('filterSubject')}
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">{t('allSubjects')}</option>
              <option value="CS-202">CS-202: Cấu trúc dữ liệu và giải thuật</option>
              <option value="CS-201">CS-201: Cơ sở dữ liệu</option>
              <option value="CS-203">CS-203: Lập trình hướng đối tượng</option>
              <option value="CS-204">CS-204: Nhập môn trí tuệ nhân tạo</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('filterCategory')}
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">{t('allCategories')}</option>
              <option value="syllabus">{t('categorySyllabus')}</option>
              <option value="slide">{t('categorySlide')}</option>
              <option value="quiz">{t('categoryQuiz')}</option>
              <option value="code">{t('categoryCode')}</option>
            </select>
          </div>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('searchMaterialPlaceholder')}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={t('viewList')}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_list_bulleted
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={t('viewGrid')}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. AI ASSISTANT & KNOWLEDGE GRAPH BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                <span>{t('aiAssistantTitle')}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                  {t('aiBadge')}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('aiAssistantDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenAutoQuiz()}
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>{t('btnAutoQuiz')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenGraph()}
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">schema</span>
              <span>{t('btnOpenGraph')}</span>
            </button>
          </div>
        </div>

        {/* 3 AI Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Feature 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">summarize</span>
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('featureSummarizeTitle')}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('featureSummarizeDesc')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">hub</span>
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('featureGraphTitle')}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('featureGraphDesc')}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">
                  psychology_alt
                </span>
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('featureRecommendTitle')}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('featureRecommendDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* 5. DATA VIEW: TABLE OR GRID */}
      {viewMode === 'list' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[900px]">
              <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/70 dark:border-slate-800 select-none">
                <tr>
                  <th className="px-3 py-3 text-center w-12 font-semibold">
                    {t('colStt')}
                  </th>
                  <th className="px-3 py-3 font-semibold" style={{ width: '280px' }}>
                    {t('colName')}
                  </th>
                  <th className="px-3 py-3 whitespace-nowrap font-semibold">
                    {t('colSubject')}
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap font-semibold">
                    {t('colCategory')}
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap font-semibold">
                    {t('colSize')}
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap font-semibold">
                    {t('colUpdated')}
                  </th>
                  <th className="px-4 py-3 text-center whitespace-nowrap font-semibold">
                    {t('colAiSync')}
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap font-semibold">
                    {t('colViews')}
                  </th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap font-semibold">
                    {t('colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                          find_in_page
                        </span>
                        <span>Không tìm thấy học liệu nào phù hợp với bộ lọc</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat, idx) => {
                    const badge = getFormatBadge(mat.format);
                    const isPinned = mat.isPinned;

                    return (
                      <tr
                        key={mat.id}
                        className={`transition-colors ${
                          isPinned
                            ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {/* STT / Pin */}
                        <td className="px-3 py-3.5 text-center text-xs font-mono font-bold">
                          {isPinned ? (
                            <span
                              className="material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400 cursor-pointer"
                              title="Đã ghim"
                              onClick={() => handleTogglePin(mat.id)}
                            >
                              push_pin
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          )}
                        </td>

                        {/* Title & File detail */}
                        <td className="px-3 py-3.5 max-w-xs">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs ${badge.bg}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {badge.icon}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                onClick={() => handleDownload(mat)}
                                className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1.5 flex-wrap"
                              >
                                <span className="truncate max-w-[210px]" title={mat.filename}>
                                  {mat.filename}
                                </span>
                                {mat.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 flex-shrink-0">
                                    {mat.badge}
                                  </span>
                                )}
                              </div>
                              {mat.subDetail && (
                                <div
                                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5"
                                  title={mat.subDetail}
                                >
                                  {mat.subDetail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Subject & Code */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {mat.subjectName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {mat.subjectCode}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                            {mat.category}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="px-3 py-3.5 text-center font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {mat.size}
                        </td>

                        {/* Updated date */}
                        <td className="px-3 py-3.5 text-center text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {mat.updatedAt}
                        </td>

                        {/* AI Sync */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{mat.aiStatus}</span>
                          </div>
                        </td>

                        {/* Views/Downloads */}
                        <td className="px-3 py-3.5 text-center font-mono text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {mat.viewsCount} lượt
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3.5 text-right whitespace-nowrap relative">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenGraph(mat)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title={t('actionGraph')}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                schema
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(mat)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title={t('actionDownload')}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                download
                              </span>
                            </button>

                            {/* Dropdown 3 dots */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(activeMenuId === mat.id ? null : mat.id)
                                }
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title={t('actionMore')}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  more_vert
                                </span>
                              </button>

                              {activeMenuId === mat.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setActiveMenuId(null)}
                                  />
                                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-30 text-xs text-left">
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePin(mat.id)}
                                      className="w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">
                                        push_pin
                                      </span>
                                      <span>
                                        {mat.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        handleOpenAutoQuiz(mat);
                                      }}
                                      className="w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">
                                        bolt
                                      </span>
                                      <span>Tạo câu hỏi Quiz</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        notify(`Đang quét lại thực thể AI cho "${mat.filename}"...`);
                                      }}
                                      className="w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">
                                        sync
                                      </span>
                                      <span>Bóc tách lại AI</span>
                                    </button>
                                    {currentRole === 'owner' && (
                                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            setMaterials((prev) =>
                                              prev.filter((m) => m.id !== mat.id)
                                            );
                                            notify(`Đã xóa học liệu "${mat.filename}".`);
                                          }}
                                          className="w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">
                                            delete
                                          </span>
                                          <span>Xóa học liệu</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              {t('showingMaterials', {
                from: filteredMaterials.length > 0 ? 1 : 0,
                to: filteredMaterials.length,
                total: 38,
              })}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center shadow-xs ${
                  currentPage === 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-lg font-medium flex items-center justify-center ${
                  currentPage === 2
                    ? 'bg-blue-600 text-white font-bold'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                2
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className={`w-8 h-8 rounded-lg font-medium flex items-center justify-center ${
                  currentPage === 3
                    ? 'bg-blue-600 text-white font-bold'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                3
              </button>
              <button
                type="button"
                disabled={currentPage === 3}
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => {
            const badge = getFormatBadge(mat.format);
            return (
              <div
                key={mat.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shadow-xs ${badge.bg}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {badge.icon}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          {mat.subjectCode}
                        </span>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {mat.subjectName}
                        </div>
                      </div>
                    </div>
                    {mat.isPinned && (
                      <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        <span className="material-symbols-outlined text-[16px]">
                          push_pin
                        </span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4
                      onClick={() => handleDownload(mat)}
                      className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1"
                      title={mat.filename}
                    >
                      {mat.filename}
                    </h4>
                    {mat.subDetail && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {mat.subDetail}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                      {mat.size}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {mat.aiStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono">{mat.viewsCount} lượt tải</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenGraph(mat)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                      title={t('actionGraph')}
                    >
                      <span className="material-symbols-outlined text-[18px]">schema</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(mat)}
                      className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 shadow-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Tải về</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: UPLOAD MATERIAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t('modalUploadTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('modalUploadDesc')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-[3px] border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('uploadDropzone')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                PDF, PPTX, DOCX, ZIP hoặc MP4 lên tới 100 MB
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('uploadSubjectLabel')}
                </label>
                <select className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  <option>CS-202: Cấu trúc dữ liệu và giải thuật</option>
                  <option>CS-201: Cơ sở dữ liệu</option>
                  <option>CS-203: Lập trình hướng đối tượng</option>
                  <option>CS-204: Nhập môn trí tuệ nhân tạo</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('uploadCategoryLabel')}
                </label>
                <select className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  <option>Slide bài giảng (PPTX)</option>
                  <option>Giáo trình chính (PDF)</option>
                  <option>Đề cương & Chuẩn ABET (PDF)</option>
                  <option>Đề thi & Quiz mẫu</option>
                  <option>Mã nguồn Lab & Testcase (ZIP)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="aiCheck"
                  defaultChecked
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="aiCheck"
                  className="text-xs text-indigo-900 dark:text-indigo-200 cursor-pointer font-medium"
                >
                  <span className="font-bold">{t('uploadAiExtract')}</span>
                  <span className="block text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                    Hệ thống sẽ tự động đọc bài học, trích xuất thực thể và liên kết vào Đồ thị tri thức lớp.
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUploadOpen(false);
                  setIsUploadAiModalOpen(true);
                  notify('Đang bắt đầu truyền tải tệp và phân tích AI học liệu...');
                }}
                className="px-5 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                {t('btnSubmitUpload')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI SCAN MODAL */}
      {isAiScanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Quét phân tích AI tự động
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ILMS Entity & Knowledge Graph Extraction Engine
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiScanOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                    Đang quét 38 tài liệu số trong lớp...
                  </span>
                  <span>98%</span>
                </div>
                <div className="w-full bg-purple-200/60 dark:bg-purple-900/60 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-600 h-2 rounded-full w-[98%]" />
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  Thực thể tri thức mới nhất được trích xuất:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    #SegmentTree
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    #AVLTree
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    #FenwickTree
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    #LCA-BinaryLifting
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    #DijkstraPriorityQueue
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Đã đồng bộ 142 quan hệ khái niệm và sẵn sàng hỗ trợ AI Tutor hỏi đáp 24/7.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAiScanOpen(false);
                  notify('Quét phân tích AI hoàn tất! 38 học liệu đã sẵn sàng trên Đồ thị tri thức.');
                }}
                className="px-5 py-2 rounded-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AUTO-QUIZ GENERATOR */}
      {isAutoQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t('btnAutoQuiz')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tạo câu hỏi trắc nghiệm tự động từ Slide bài giảng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoQuizOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tài liệu nguồn được chọn
                </label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">
                    slideshow
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {selectedMaterial?.filename || 'Slide_Chuong05_Cay_phan_doan.pptx'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Cấu trúc dữ liệu và giải thuật (CS-202)
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cấp độ tư duy (Bloom)
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                    <option>Bloom 3: Vận dụng (Application)</option>
                    <option>Bloom 1: Ghi nhớ (Recall)</option>
                    <option>Bloom 2: Thấu hiểu (Understand)</option>
                    <option>Bloom 4: Phân tích (Analysis)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Số lượng câu hỏi
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                    <option>5 câu hỏi nhanh</option>
                    <option>10 câu trắc nghiệm</option>
                    <option>15 câu toàn chương</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-slate-700 dark:text-slate-300 space-y-1">
                <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Ví dụ câu hỏi được AI tạo ra:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  &quot;Khi cập nhật đoạn [L, R] trên Cây phân đoạn với kỹ thuật Lazy Propagation, độ phức tạp thời gian đạt bao nhiêu?&quot;
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAutoQuizOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAutoQuizOpen(false);
                  notify(t('toastQuizGenerated'));
                }}
                className="px-5 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Tạo và thêm vào đề thi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: KNOWLEDGE GRAPH PREVIEW */}
      {isGraphOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">schema</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Sơ đồ Đồ thị Tri thức Lớp học (Knowledge Canvas)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedMaterial
                      ? `Ánh xạ tri thức từ: ${selectedMaterial.filename}`
                      : 'Mạng lưới khái niệm toàn bộ môn học'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGraphOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Visual Graph Canvas Mock */}
            <div className="h-64 rounded-2xl bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 border border-slate-800">
              <div className="absolute inset-0 opacity-15">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="modalGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="12" cy="12" r="1" fill="#FFFFFF" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#modalGrid)" />
                </svg>
              </div>

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 2" />
                <line x1="50%" y1="50%" x2="75%" y2="35%" stroke="#8B5CF6" strokeWidth="2" />
                <line x1="50%" y1="50%" x2="75%" y2="65%" stroke="#10B981" strokeWidth="2" />
              </svg>

              {/* Graph Nodes */}
              <div className="relative z-10 flex items-center justify-around w-full max-w-lg">
                <div className="px-3.5 py-2 rounded-xl bg-blue-900/80 border border-blue-400 text-blue-200 text-xs font-bold text-center shadow-lg">
                  <div>Mảng 1D &amp; Prefix</div>
                  <span className="text-[10px] text-blue-300 font-normal">Tiên quyết</span>
                </div>

                <div className="px-4 py-2.5 rounded-2xl bg-purple-900/90 border-[3px] border-purple-400 text-purple-100 text-xs font-extrabold text-center shadow-xl animate-pulse">
                  <div>Segment Tree</div>
                  <span className="text-[10px] text-purple-300 font-normal">Đang học • 18 nodes</span>
                </div>

                <div className="space-y-4">
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-200 text-xs font-bold text-center">
                    Lazy Propagation
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-900/80 border border-amber-400 text-amber-200 text-xs font-bold text-center">
                    Fenwick Tree
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Độ hoàn thành bóc tách tri thức: <strong className="text-emerald-600 dark:text-emerald-400">100%</strong></span>
              <button
                type="button"
                onClick={() => {
                  setIsGraphOpen(false);
                  notify('Chuyển hướng đến Không gian Đồ thị Tri thức tương tác đầy đủ...');
                }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Mở trong Canvas lớn →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: UPLOAD & AI REALTIME PIPELINE MODAL */}
      <UploadMaterialModal
        isOpen={isUploadAiModalOpen}
        onClose={() => setIsUploadAiModalOpen(false)}
        onCancelAll={() => {
          setIsUploadAiModalOpen(false);
          notify('Đã hủy toàn bộ tiến trình tải lên và phân tích AI!');
        }}
        onRunInBackground={() => {
          setIsUploadAiModalOpen(false);
          notify('Tiến trình tải lên và phân tích AI đang tiếp tục chạy ngầm trong nền!');
        }}
      />
    </div>
  );
}

