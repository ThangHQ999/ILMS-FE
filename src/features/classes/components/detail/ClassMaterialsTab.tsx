'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { CustomSelect } from '@/components/shared';
import { classDetailKeys } from '../../hooks/useClassDetail';
import type { ClassCourse, ClassMaterial } from '../../schemas/class-detail.schema';
import { getClassMaterials } from '../../services/class-detail.service';
import { UploadMaterialModal } from './UploadMaterialModal';

const PAGE_SIZE = 10;

interface ClassMaterialsTabProps {
  classId: string;
  courses: ClassCourse[];
  currentRole?: 'owner' | 'teacher' | 'student';
  onToast?: (message: string) => void;
}

export function ClassMaterialsTab({
  classId,
  courses,
  currentRole = 'owner',
  onToast,
}: ClassMaterialsTabProps) {
  const router = useRouter();
  const t = useTranslations('classes.detail');

  const [searchQuery, setSearchQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const next = searchQuery.trim();
    if (next === search) return;
    const timer = window.setTimeout(() => {
      setSearch(next);
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery, search]);

  const params = {
    page: currentPage - 1,
    size: PAGE_SIZE,
    courseId: selectedSubject === 'ALL' ? undefined : selectedSubject,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    search: search || undefined,
  };
  const materialsQuery = useQuery({
    queryKey: [...classDetailKeys.materials(classId), params],
    queryFn: ({ signal }) => getClassMaterials(classId, params, signal),
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const materialPage = materialsQuery.data;
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  useEffect(() => {
    if (materialPage) {
      setMaterials(materialPage.items);
      setCurrentPage(page => Math.min(page, Math.max(1, materialPage.totalPages)));
    }
  }, [materialPage]);

  const subjectOptions = useMemo(() => courses.filter(course => course.status === 'ACTIVE').map(course => ({
    value: course.id,
    label: course.code && course.code !== course.name ? `${course.code} · ${course.name}` : course.name,
  })), [courses]);

  const syncedCount = useMemo(
    () => materials.filter((m) => m.aiStatusType === 'synced').length,
    [materials]
  );
  const totalConceptsCount = useMemo(
    () => materials.reduce((sum, m) => sum + (m.conceptsCount ?? 0), 0),
    [materials]
  );
  const aiSyncPercent =
    materials.length > 0 ? Math.round((syncedCount / materials.length) * 100) : 0;

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [isUploadAiModalOpen, setIsUploadAiModalOpen] = useState(false);
  const [isAutoQuizOpen, setIsAutoQuizOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<ClassMaterial | null>(null);
  const [uploadSubject, setUploadSubject] = useState('CS-202: Cấu trúc dữ liệu và giải thuật');
  const [uploadCategory, setUploadCategory] = useState('Slide bài giảng (PPTX)');
  const [quizBloomLevel, setQuizBloomLevel] = useState('Bloom 3: Vận dụng (Application)');
  const [quizQuestionCount, setQuizQuestionCount] = useState('5 câu hỏi nhanh');

  // Internal toast helper
  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  const paginatedMaterials = useMemo(
    () => [...materials].sort((a, b) => Number(b.isPinned) - Number(a.isPinned)),
    [materials],
  );
  const totalPages = materialPage?.totalPages ?? 0;
  const totalMaterials = materialPage?.totalElements ?? 0;
  const showingFrom = materials.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingTo = materials.length ? showingFrom + materials.length - 1 : 0;

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
    const query = new URLSearchParams();
    const targetCourseId =
      material?.courseId || courses[0]?.id || materials[0]?.courseId;
    if (targetCourseId) {
      query.set('courseId', targetCourseId);
    }
    if (material?.id) {
      query.set('materialId', material.id);
    }
    const qs = query.toString();
    router.push(qs ? `/knowledge-graph?${qs}` : '/knowledge-graph');
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
            <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-[#A8C7FA]">
              assignment
            </span>
            <span>Hàng đợi AI</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsUploadAiModalOpen(true)}
            className="h-9 px-4 rounded-full font-semibold text-xs text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-[#A8C7FA]">
              auto_awesome
            </span>
            <span>{t('btnAiScan')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="h-9 px-4 rounded-full font-semibold text-xs bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">upload_file</span>
            <span>+ {t('btnUploadMaterial')}</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Extracted Knowledge Concepts */}
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#8E918F]">
              {t('materialsPageConcepts')}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-blue-600 dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">hub</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-[#E3E3E3]">
              {totalConceptsCount}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-[#8E918F]">
              khái niệm đã bóc tách
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8E918F] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>
              {syncedCount > 0
                ? `Từ ${syncedCount} học liệu đã đồng bộ đồ thị`
                : 'Chưa có học liệu nào bóc tách'}
            </span>
          </div>
        </div>

        {/* KPI 2: Uploaded count */}
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#8E918F]">
              {t('materialsMatching')}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-emerald-700 dark:text-[#81C995] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-[#81C995]">
              {materialPage ? totalMaterials : '—'}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-[#8E918F]">tài liệu số</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8E918F] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t('kpiUploadedNote')}</span>
          </div>
        </div>

        {/* KPI 3: Subject Allocation */}
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#8E918F]">
              {t('kpiSubjects')}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-blue-600 dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">library_books</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-[#E3E3E3]">
              {subjectOptions.length}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-[#8E918F]">{t('materialsAssignedCourses')}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-[#8E918F]">
            <span className="font-semibold text-blue-600 dark:text-[#A8C7FA]">
              {materials.length > 0 ? 'Dữ liệu đồng bộ theo môn' : 'Chưa có giáo trình'}
            </span>
          </div>
        </div>

        {/* KPI 4: AI Extraction */}
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#8E918F]">
              {t('materialsPageAiSync')}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {materials.length > 0 ? `${aiSyncPercent}%` : '--'}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-[#8E918F]">
              ({syncedCount}/{materials.length} tài liệu)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            <span>{t('kpiAiExtractNote')}</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-3xl border-none shadow-sm dark:shadow-none flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {t('filterSubject')}
            </span>
            <CustomSelect<string>
              value={selectedSubject}
              onChange={(val) => {
                setSelectedSubject(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: t('allSubjects') },
                ...subjectOptions,
              ]}
              className="min-w-[200px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {t('filterCategory')}
            </span>
            <CustomSelect<string>
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: t('allCategories') },
                { value: 'syllabus', label: t('categorySyllabus') },
                { value: 'slide', label: t('categorySlide') },
                { value: 'quiz', label: t('categoryQuiz') },
                { value: 'code', label: t('categoryCode') },
              ]}
              className="min-w-[160px]"
            />
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 shadow-sm dark:shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C] text-blue-600 dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2 flex-wrap">
                <span>{t('aiAssistantTitle')}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#D3E3FD]/60 dark:bg-[#1A2E4D] text-[#041E49] dark:text-[#A8C7FA] border-none">
                  {t('aiBadge')}
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-0.5">
                {t('aiAssistantDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenAutoQuiz()}
              className="text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] px-4 py-2 rounded-full text-xs font-semibold border-none bg-transparent transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>{t('btnAutoQuiz')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenGraph()}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer border-none"
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
              {syncedCount > 0
                ? `${syncedCount} học liệu đã đồng bộ vào ${totalConceptsCount} khái niệm (concepts) trên đồ thị tri thức.`
                : 'Chưa có học liệu nào được đồng bộ lên đồ thị tri thức.'}
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
      {materialsQuery.isPending ? (
        <p role="status" className="rounded-3xl bg-surface p-6 text-sm">{t('materialsLoading')}</p>
      ) : materialsQuery.isError && !materialPage ? (
        <div role="alert" className="rounded-3xl bg-surface p-6 text-sm">
          <p>{t('materialsLoadError')}</p>
          <button type="button" onClick={() => void materialsQuery.refetch()} className="mt-3 font-semibold text-primary">
            {t('retryClassContent')}
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none shadow-sm dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[900px]">
              <thead className="bg-[#F0F4F8] dark:bg-[#131314] text-[11px] font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider border-none select-none">
                <tr>
                  <th className="py-4 px-3 w-14 text-center align-middle">
                    {t('colStt')}
                  </th>
                  <th className="py-4 px-4 min-w-[280px] align-middle">
                    {t('colName')}
                  </th>
                  <th className="py-4 px-3 w-[180px] min-w-[140px] align-middle whitespace-nowrap">
                    {t('colSubject')}
                  </th>
                  <th className="py-4 px-3 w-[130px] min-w-[110px] text-center align-middle whitespace-nowrap">
                    {t('colCategory')}
                  </th>
                  <th className="py-4 px-3 w-[110px] text-center align-middle whitespace-nowrap">
                    {t('colSize')}
                  </th>
                  <th className="py-4 px-3 w-[120px] text-center align-middle whitespace-nowrap">
                    {t('colUpdated')}
                  </th>
                  <th className="py-4 px-4 w-[140px] min-w-[120px] text-center align-middle whitespace-nowrap">
                    {t('colAiSync')}
                  </th>
                  <th className="py-4 px-3 w-[110px] text-center align-middle whitespace-nowrap">
                    {t('colViews')}
                  </th>
                  <th className="py-4 px-4 w-[130px] text-right align-middle whitespace-nowrap">
                    {t('colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-[#C4C7C5] border-none font-medium">
                {paginatedMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 dark:text-[#8E918F] text-sm align-middle">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-[#8E918F]">
                          find_in_page
                        </span>
                        <span>{t('materialsNoMatches')}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedMaterials.map((mat, idx) => {
                    const badge = getFormatBadge(mat.format);
                    const isPinned = mat.isPinned;

                    return (
                      <tr
                        key={mat.id}
                        className={`transition-colors border-none ${
                          isPinned
                            ? 'bg-blue-50/40 dark:bg-[#1A2E4D]/20 hover:bg-blue-50/60 dark:hover:bg-[#1A2E4D]/30'
                            : 'hover:bg-black/[0.03] dark:hover:bg-white/5'
                        }`}
                      >
                        {/* STT / Pin */}
                        <td className="py-5 px-3 text-center align-middle text-xs font-mono font-bold">
                          {isPinned ? (
                            <span
                              className="material-symbols-outlined text-[17px] text-blue-600 dark:text-[#A8C7FA] cursor-pointer"
                              title="Đã ghim"
                              onClick={() => handleTogglePin(mat.id)}
                            >
                              push_pin
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-[#8E918F]">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          )}
                        </td>

                        {/* Title & File detail */}
                        <td className="py-5 px-4 align-middle max-w-xs">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-2xl font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${badge.bg}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {badge.icon}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                onClick={() => handleDownload(mat)}
                                className="font-semibold text-gray-900 dark:text-[#E3E3E3] text-sm hover:text-blue-600 dark:hover:text-[#A8C7FA] cursor-pointer flex items-center gap-1.5 flex-wrap"
                              >
                                <span className="truncate max-w-[210px]" title={mat.filename}>
                                  {mat.filename}
                                </span>
                                {mat.badge && (
                                  <span className="whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] shrink-0 border-none">
                                    {mat.badge}
                                  </span>
                                )}
                              </div>
                              {mat.subDetail && (
                                <div
                                  className="text-xs text-gray-500 dark:text-[#8E918F] truncate mt-0.5"
                                  title={mat.subDetail}
                                >
                                  {mat.subDetail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Subject & Code */}
                        <td className="py-5 px-3 align-middle whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                              {mat.subjectName}
                            </span>
                            <span className="text-[11px] font-mono text-gray-400 dark:text-[#8E918F]">
                              {mat.subjectCode}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-5 px-3 text-center align-middle whitespace-nowrap">
                          <span className="whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] border-none">
                            {mat.category}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="py-5 px-3 text-center align-middle font-mono text-xs text-gray-600 dark:text-[#C4C7C5] whitespace-nowrap">
                          {mat.size}
                        </td>

                        {/* Updated date */}
                        <td className="py-5 px-3 text-center align-middle text-xs text-gray-500 dark:text-[#8E918F] whitespace-nowrap">
                          {mat.updatedAt}
                        </td>

                        {/* AI Sync */}
                        <td className="py-5 px-4 text-center align-middle whitespace-nowrap">
                          <div className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] border-none text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{mat.aiStatus}</span>
                          </div>
                        </td>

                        {/* Views/Downloads */}
                        <td className="py-5 px-3 text-center align-middle font-mono text-xs font-bold text-gray-800 dark:text-[#E3E3E3] whitespace-nowrap">
                          {mat.viewsCount} lượt
                        </td>

                        {/* Actions */}
                        <td className="py-5 px-4 text-right align-middle whitespace-nowrap relative">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenGraph(mat)}
                              className="p-2 text-blue-600 dark:text-[#A8C7FA] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                              title={t('actionGraph')}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                schema
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(mat)}
                              className="p-2 text-gray-500 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border-none bg-transparent cursor-pointer"
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
                                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-[#E3E3E3] rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer"
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
                                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border-none py-1.5 z-30 text-xs text-left">
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePin(mat.id)}
                                      className="w-full px-3.5 py-2 text-gray-700 dark:text-[#C4C7C5] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 border-none bg-transparent"
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
                                      className="w-full px-3.5 py-2 text-gray-700 dark:text-[#C4C7C5] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 border-none bg-transparent"
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

        </div>
      ) : paginatedMaterials.length === 0 ? (
        <p className="rounded-3xl bg-surface p-6 text-sm text-muted-foreground">{t('materialsNoMatches')}</p>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedMaterials.map((mat) => {
            const badge = getFormatBadge(mat.format);
            return (
              <div
                key={mat.id}
                className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all flex flex-col justify-between space-y-4"
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
                      className="px-4 py-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold flex items-center gap-1 transition-all border-none cursor-pointer"
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

      {materialPage && totalMaterials > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-sm text-muted-foreground">
          <span>{t('showingMaterials', { from: showingFrom, to: showingTo, total: totalMaterials })}</span>
          {totalPages > 1 && (
            <nav aria-label={t('materialsPagination')} className="flex items-center gap-3">
              <button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}
                className="rounded-full bg-surface-hover px-3 py-1.5 font-medium text-on-surface disabled:opacity-40">
                {t('materialsPrevious')}
              </button>
              <span>{t('materialsPage', { page: currentPage, total: totalPages })}</span>
              <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}
                className="rounded-full bg-surface-hover px-3 py-1.5 font-medium text-on-surface disabled:opacity-40">
                {t('materialsNext')}
              </button>
            </nav>
          )}
        </div>
      )}

      {/* MODAL 1: UPLOAD MATERIAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-blue-600 dark:text-[#A8C7FA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                    {t('modalUploadTitle')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                    {t('modalUploadDesc')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 flex items-center justify-center cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            {/* Dropzone */}
            <div className="bg-[#F0F4F8] dark:bg-[#131314] rounded-2xl p-6 text-center border-none hover:opacity-90 transition-opacity cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C] text-blue-600 dark:text-[#A8C7FA] flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <p className="text-xs font-semibold text-gray-800 dark:text-[#E3E3E3]">
                {t('uploadDropzone')}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-[#8E918F] mt-1">
                PDF, PPTX, DOCX, ZIP hoặc MP4 lên tới 100 MB
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('uploadSubjectLabel')}
                </label>
                <CustomSelect<string>
                  value={uploadSubject}
                  onChange={setUploadSubject}
                  options={[
                    { value: 'CS-202: Cấu trúc dữ liệu và giải thuật', label: 'CS-202: Cấu trúc dữ liệu và giải thuật' },
                    { value: 'CS-201: Cơ sở dữ liệu', label: 'CS-201: Cơ sở dữ liệu' },
                    { value: 'CS-203: Lập trình hướng đối tượng', label: 'CS-203: Lập trình hướng đối tượng' },
                    { value: 'CS-204: Nhập môn trí tuệ nhân tạo', label: 'CS-204: Nhập môn trí tuệ nhân tạo' },
                  ]}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('uploadCategoryLabel')}
                </label>
                <CustomSelect<string>
                  value={uploadCategory}
                  onChange={setUploadCategory}
                  options={[
                    { value: 'Slide bài giảng (PPTX)', label: 'Slide bài giảng (PPTX)' },
                    { value: 'Giáo trình chính (PDF)', label: 'Giáo trình chính (PDF)' },
                    { value: 'Đề cương & Chuẩn ABET (PDF)', label: 'Đề cương & Chuẩn ABET (PDF)' },
                    { value: 'Đề thi & Quiz mẫu', label: 'Đề thi & Quiz mẫu' },
                    { value: 'Mã nguồn Lab & Testcase (ZIP)', label: 'Mã nguồn Lab & Testcase (ZIP)' },
                  ]}
                />
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
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 shadow-xs border-none cursor-pointer transition-all"
              >
                {t('btnSubmitUpload')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI SCAN MODAL */}
      {isAiScanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-scaleUp">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-blue-600 dark:text-[#A8C7FA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                    {t('btnAutoQuiz')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                    Tạo câu hỏi trắc nghiệm tự động từ Slide bài giảng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoQuizOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 flex items-center justify-center cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1">
                  Tài liệu nguồn được chọn
                </label>
                <div className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">
                    slideshow
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 dark:text-[#E3E3E3] truncate">
                      {selectedMaterial?.filename || 'Slide_Chuong05_Cay_phan_doan.pptx'}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                      Cấu trúc dữ liệu và giải thuật (CS-202)
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1">
                    Cấp độ tư duy (Bloom)
                  </label>
                  <CustomSelect<string>
                    value={quizBloomLevel}
                    onChange={setQuizBloomLevel}
                    options={[
                      { value: 'Bloom 3: Vận dụng (Application)', label: 'Bloom 3: Vận dụng (Application)' },
                      { value: 'Bloom 1: Ghi nhớ (Recall)', label: 'Bloom 1: Ghi nhớ (Recall)' },
                      { value: 'Bloom 2: Thấu hiểu (Understand)', label: 'Bloom 2: Thấu hiểu (Understand)' },
                      { value: 'Bloom 4: Phân tích (Analysis)', label: 'Bloom 4: Phân tích (Analysis)' },
                    ]}
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1">
                    Số lượng câu hỏi
                  </label>
                  <CustomSelect<string>
                    value={quizQuestionCount}
                    onChange={setQuizQuestionCount}
                    options={[
                      { value: '5 câu hỏi nhanh', label: '5 câu hỏi nhanh' },
                      { value: '10 câu trắc nghiệm', label: '10 câu trắc nghiệm' },
                      { value: '15 câu toàn chương', label: '15 câu toàn chương' },
                    ]}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none text-gray-700 dark:text-[#C4C7C5] space-y-1">
                <div className="font-semibold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#A8C7FA]">check_circle</span>
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
                className="text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer border-none bg-transparent transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAutoQuizOpen(false);
                  notify(t('toastQuizGenerated'));
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 shadow-xs border-none cursor-pointer transition-all"
              >
                Tạo và thêm vào đề thi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: KNOWLEDGE GRAPH PREVIEW */}
      {isGraphOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-4 animate-scaleUp">
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

                <div className="px-4 py-2.5 rounded-2xl bg-purple-900/90 border-none text-purple-100 text-xs font-semibold text-center shadow-xl animate-pulse">
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

