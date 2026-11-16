'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';
import type { ClassCourse, CourseTemplate } from '../../schemas/class-detail.schema';
import { MOCK_TEMPLATES } from '../../services/class-detail.service';
import { CourseCard } from './CourseCard';

interface ClassSubjectsTabProps {
  courses: ClassCourse[];
  templates?: CourseTemplate[];
  currentRole: 'owner' | 'teacher' | 'student';
  onAddExistingClick: () => void;
  onCreateNewClick: () => void;
  onRemoveClick: (course: ClassCourse) => void;
  onAssignTeacherClick: (course: ClassCourse) => void;
  onToast?: (message: string) => void;
}

export function ClassSubjectsTab({
  courses: initialCourses,
  templates = MOCK_TEMPLATES,
  currentRole,
  onAddExistingClick,
  onCreateNewClick,
  onRemoveClick,
  onAssignTeacherClick,
  onToast,
}: ClassSubjectsTabProps) {
  const t = useTranslations('classes.detail');

  // Course state (supports cloning)
  const [courseList, setCourseList] = useState<ClassCourse[]>(initialCourses);

  useEffect(() => {
    if (initialCourses && initialCourses.length > 0) {
      setCourseList(initialCourses);
    }
  }, [initialCourses]);

  // Filters & Sorters
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [instructorFilter, setInstructorFilter] = useState('ALL');
  const [sortFilter, setSortFilter] = useState<'progress' | 'code' | 'name' | 'recent'>('progress');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isAllTemplatesOpen, setIsAllTemplatesOpen] = useState(false);
  const [extractingCourse, setExtractingCourse] = useState<ClassCourse | null>(null);

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  // Filtered & Sorted Courses
  const filteredCourses = useMemo(() => {
    let result = [...courseList];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.instructorName && c.instructorName.toLowerCase().includes(q))
      );
    }

    // Semester filter
    if (semesterFilter !== 'ALL') {
      result = result.filter((c) => c.semester === semesterFilter);
    }

    // Instructor filter
    if (instructorFilter !== 'ALL') {
      result = result.filter(
        (c) => c.instructorName && c.instructorName.includes(instructorFilter)
      );
    }

    // Sorter
    if (sortFilter === 'progress') {
      result.sort((a, b) => (b.teachingProgress || 0) - (a.teachingProgress || 0));
    } else if (sortFilter === 'code') {
      result.sort((a, b) => a.code.localeCompare(b.code));
    } else if (sortFilter === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [courseList, search, semesterFilter, instructorFilter, sortFilter]);

  // Clone template action
  const handleCloneTemplate = (tpl: CourseTemplate) => {
    const newCourse: ClassCourse = {
      id: `course-${Date.now()}`,
      code: `CS-${Math.floor(100 + Math.random() * 900)}`,
      name: tpl.title,
      credits: tpl.credits,
      semester: 'Học kỳ I (2024-2025)',
      status: 'ACTIVE',
      instructorName: 'TS. Lê Hoàng Nam',
      teachingProgress: 0,
      currentWeek: 'Tuần 1/15',
      studentsCount: 42,
      knowledgeNodesCount: 115,
      classAvgScore: 8.4,
    };
    setCourseList((prev) => [newCourse, ...prev]);
    notify(`Đã nhân bản mẫu "${tpl.title}" vào danh sách môn học liên kết!`);
    setIsAllTemplatesOpen(false);
  };

  const handleTriggerAiExtract = (course: ClassCourse) => {
    setExtractingCourse(course);
    setTimeout(() => {
      setExtractingCourse(null);
      notify(t('toastAiExtracted', { code: course.code }));
    }, 2400);
  };

  const getSubjectIcon = (code: string) => {
    if (code.includes('202')) return 'account_tree';
    if (code.includes('301')) return 'memory';
    if (code.includes('101')) return 'terminal';
    if (code.includes('205')) return 'database';
    return 'library_books';
  };

  return (
    <div className="space-y-6">
      {/* 1. TOOLBAR: Filters, Search, Views & Primary Action */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white dark:bg-[#1E1F20] p-5 rounded-3xl border-none shadow-sm dark:shadow-none">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex items-center bg-[#E1E5EA] dark:bg-[#282A2C] px-3.5 py-2 rounded-full w-full sm:w-72 border-none">
            <span className="material-symbols-outlined text-gray-500 dark:text-[#8E918F] text-[18px] mr-2">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchSubjectPlaceholder')}
              className="w-full bg-transparent text-xs text-gray-800 dark:text-[#C4C7C5] placeholder-gray-500 dark:placeholder-[#8E918F] outline-none border-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xs ml-1 border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Semester Filter */}
          <div className="relative">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="appearance-none bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold pl-4 pr-8 py-2 rounded-full outline-none border-none cursor-pointer"
            >
              <option value="ALL">{t('filterSemesterAll')}</option>
              <option value="Học kỳ II (2024-2025)">{t('filterSemester2')}</option>
              <option value="Học kỳ I (2024-2025)">{t('filterSemester1')}</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[17px] text-gray-500 dark:text-[#8E918F]">
              expand_more
            </span>
          </div>

          {/* Instructor Filter */}
          <div className="relative">
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="appearance-none bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold pl-4 pr-8 py-2 rounded-full outline-none border-none cursor-pointer"
            >
              <option value="ALL">{t('filterInstructorAll')}</option>
              <option value="Nguyễn Văn An">TS. Nguyễn Văn An (Chủ nhiệm)</option>
              <option value="Lê Hoàng Nam">ThS. Lê Hoàng Nam</option>
              <option value="Đặng Minh Quân">TS. Đặng Minh Quân</option>
              <option value="Ban Giảng huấn">Ban Giảng huấn CNTT</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[17px] text-gray-500 dark:text-[#8E918F]">
              expand_more
            </span>
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <select
              value={sortFilter}
              onChange={(e) =>
                setSortFilter(e.target.value as 'progress' | 'code' | 'name' | 'recent')
              }
              className="appearance-none bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold pl-4 pr-8 py-2 rounded-full outline-none border-none cursor-pointer"
            >
              <option value="progress">{t('sortProgress')}</option>
              <option value="code">{t('sortCode')}</option>
              <option value="name">{t('sortName')}</option>
              <option value="recent">{t('sortRecent')}</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[17px] text-gray-500 dark:text-[#8E918F]">
              swap_vert
            </span>
          </div>
        </div>

        {/* View Mode Switcher & Primary Action */}
        <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
          {/* Grid / List Switcher */}
          <div className="inline-flex p-1 bg-[#E1E5EA] dark:bg-[#282A2C] rounded-full border-none">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center border-none cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-transparent'
              }`}
              title={t('viewGrid')}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center border-none cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-transparent'
              }`}
              title={t('viewList')}
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>

          {/* Primary Create CTA */}
          {currentRole === 'owner' && (
            <button
              type="button"
              onClick={onCreateNewClick}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs transition-all border-none cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{t('createSubjectNewBtn')}</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. COURSES CONTAINER (Bento Grid or List Display) */}
      {filteredCourses.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-8 space-y-3 shadow-sm dark:shadow-none">
          <div className="w-12 h-12 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-500 dark:text-[#8E918F] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">search_off</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-[#E3E3E3] text-base">
            Không tìm thấy môn học phù hợp
          </h4>
          <p className="text-xs text-gray-500 dark:text-[#8E918F] max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc học kỳ, giảng viên.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSemesterFilter('ALL');
              setInstructorFilter('ALL');
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] hover:opacity-85 border-none cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* BENTO GRID VIEW - COMPLETELY OVERWRITTEN WITH EXACT MD3 FLAT CARD */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              canRemove={currentRole === 'owner'}
              onAssignTeacher={() => onAssignTeacherClick(c)}
              onAiExtract={() => handleTriggerAiExtract(c)}
              onRemove={() => onRemoveClick(c)}
            />
          ))}
        </div>
      ) : (
        /* LIST VIEW - MD3 CLEAN FLAT TONAL */
        <div className="flex flex-col gap-5">
          {filteredCourses.map((c) => {
            const iconName = getSubjectIcon(c.code);

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none border-none flex flex-col md:flex-row md:items-center justify-between gap-5 transition-transform hover:-translate-y-0.5 duration-200"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[24px]">
                      {iconName}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA] border-none">
                        {c.code}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] truncate">
                        {c.name}
                      </h3>
                      <span className="whitespace-nowrap text-xs px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] font-semibold border-none">
                        {t('credits', { count: c.credits || 4 })}
                      </span>
                      <span className="whitespace-nowrap text-xs px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] font-semibold border-none">
                        {c.currentWeek || 'Tuần 9/15'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-gray-500 dark:text-[#8E918F]">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        {c.instructorName || 'Ban Giảng huấn CNTT'}
                      </span>
                      <span>•</span>
                      <span className="whitespace-nowrap">
                        <strong className="text-gray-900 dark:text-[#E3E3E3] font-semibold">
                          {c.studentsCount || 42}
                        </strong>{' '}
                        Sinh viên
                      </span>
                      <span>•</span>
                      <span className="whitespace-nowrap">
                        <strong className="text-gray-900 dark:text-[#E3E3E3] font-semibold">
                          {c.knowledgeNodesCount || 115}
                        </strong>{' '}
                        Node Tri thức
                      </span>
                      <span>•</span>
                      <span className="whitespace-nowrap">
                        ĐTB:{' '}
                        <strong className="text-emerald-600 dark:text-[#81C995] font-semibold">
                          {c.classAvgScore || 8.4}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <Link
                    href={`/courses/${c.id}`}
                    className="px-5 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs transition-all border-none flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Vào môn học</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. SECTION: SHARED COURSE TEMPLATES */}
      <section className="mt-8 flex flex-col gap-4 bg-white dark:bg-[#1E1F20] p-6 sm:p-7 rounded-3xl border-none shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">dataset</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                {t('templatesSectionTitle')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-0.5">
                {t('templatesSectionDesc')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAllTemplatesOpen(true)}
            className="text-xs font-semibold text-blue-600 dark:text-[#A8C7FA] hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto border-none bg-transparent cursor-pointer"
          >
            <span>{t('viewAllTemplates', { count: 28 })}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl bg-gray-50 dark:bg-[#131314] hover:bg-gray-100/70 dark:hover:bg-[#282A2C] transition-all flex flex-col justify-between gap-4 border-none"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] border-none">
                    {tpl.badge}
                  </span>
                  <span className="font-mono text-xs font-semibold text-gray-500 dark:text-[#8E918F]">
                    {t('credits', { count: tpl.credits })}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mt-0.5 line-clamp-1">
                  {tpl.title}
                </h4>

                <p className="text-xs text-gray-500 dark:text-[#8E918F] line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-gray-500 dark:text-[#8E918F] text-xs">
                  <span className="material-symbols-outlined text-[16px]">
                    download_for_offline
                  </span>
                  <span>{t('timesUsed', { count: tpl.usedCount })}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCloneTemplate(tpl)}
                  className="px-3.5 py-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] font-semibold text-xs transition-all inline-flex items-center gap-1.5 border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  <span>{t('btnCloneSubject')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL 1: VIEW ALL 28 TEMPLATES */}
      {isAllTemplatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 sm:p-7 max-w-3xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-scaleUp">
            <div className="flex items-center justify-between pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">dataset</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                    Kho Khung Môn Học &amp; Giáo Trình Chuẩn (28 Mẫu)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                    Tương thích chuẩn ABET, Bộ GD&amp;ĐT và Chứng chỉ Quốc tế
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllTemplatesOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#282A2C] text-gray-500 dark:text-[#8E918F] flex items-center justify-center border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {[
                ...templates,
                {
                  id: 'tpl-04',
                  title: 'Thị giác Máy tính & Học sâu (Computer Vision with PyTorch)',
                  badge: 'AI Advanced',
                  credits: 4,
                  description:
                    '18 bài lab thực hành CNN, YOLOv8, Vision Transformer và trích xuất đặc trưng hình ảnh.',
                  usedCount: 215,
                },
                {
                  id: 'tpl-05',
                  title: 'Kiến trúc Vi dịch vụ & Phân tán (Distributed Systems)',
                  badge: 'ABET-CS',
                  credits: 4,
                  description:
                    'Thuật toán đồng thuận Raft/Paxos, thiết kế Event-driven với Apache Kafka và gRPC.',
                  usedCount: 180,
                },
                {
                  id: 'tpl-06',
                  title: 'Phát triển Ứng dụng Di động Đa nền tảng (Flutter & Native)',
                  badge: 'Doanh nghiệp IT',
                  credits: 3,
                  description:
                    'Xây dựng ứng dụng hoàn chỉnh tích hợp Firebase Auth, Cloud Firestore và chuẩn UI Material 3.',
                  usedCount: 264,
                },
              ].map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131314] border-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-100/70 transition-all"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA]">
                        {tpl.badge}
                      </span>
                      <span className="text-xs font-mono font-semibold text-gray-500">
                        {tpl.credits} Tín chỉ
                      </span>
                    </div>
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      {tpl.title}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                      {tpl.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCloneTemplate(tpl)}
                    className="px-4 py-2 rounded-full bg-blue-100 dark:bg-[#A8C7FA] text-blue-900 dark:text-[#062E6F] font-semibold text-xs inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 border-none cursor-pointer hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      content_copy
                    </span>
                    <span>Nhân bản vào lớp</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAllTemplatesOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] hover:opacity-85 border-none cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI ENTITY EXTRACTION SIMULATION */}
      {extractingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl animate-spin">
                sync
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                Đang bóc tách thực thể AI...
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                Môn học: <strong className="text-gray-900 dark:text-[#E3E3E3]">{extractingCourse.code} - {extractingCourse.name}</strong>
              </p>
            </div>
            <div className="w-full bg-[#E1E5EA] dark:bg-[#282A2C] rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-[#007BFF] dark:bg-[#A8C7FA] rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-[#8E918F]">
              Hệ thống đang trích xuất các Node Tri thức và ánh xạ vào Cây năng lực PLO.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
