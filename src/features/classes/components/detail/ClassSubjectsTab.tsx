'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ClassCourse, CourseTemplate } from '../../schemas/class-detail.schema';
import { MOCK_TEMPLATES } from '../../services/class-detail.service';

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

  // Action Menu dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
      code: `CS-${Math.floor(200 + Math.random() * 200)}`,
      name: tpl.title,
      status: 'ACTIVE',
      credits: tpl.credits,
      currentWeek: 'Tuần 1/15',
      instructorName: 'TS. Nguyễn Văn An (CN)',
      instructorAvatar: 'NA',
      instructorColor: 'bg-blue-600',
      hasAiTutor: true,
      lecturesCount: 16,
      knowledgeNodesCount: 64,
      quizzesCount: 6,
      teachingProgress: 0,
      specialFeature: 'Tự động đồng bộ AI',
      specialFeatureIcon: 'auto_awesome',
      semester: 'Học kỳ II (2024-2025)',
      description: tpl.description,
    };

    setCourseList((prev) => [newCourse, ...prev]);
    setIsAllTemplatesOpen(false);
    notify(t('toastCloned', { name: tpl.title }));
  };

  // Trigger AI entity extraction
  const handleTriggerAiExtract = (course: ClassCourse) => {
    setExtractingCourse(course);
    setTimeout(() => {
      setExtractingCourse(null);
      notify(t('toastAiExtracted', { code: course.code }));
    }, 2400);
  };

  // Helper for Card Icon
  const getSubjectIcon = (code: string) => {
    if (code.includes('202')) return 'account_tree';
    if (code.includes('301')) return 'memory';
    if (code.includes('101')) return 'terminal';
    if (code.includes('205')) return 'database';
    return 'library_books';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOOLBAR: Filters, Search, Views & Primary Action */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl w-full sm:w-72 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-600/25 focus-within:border-blue-600 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-[19px] mr-2">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchSubjectPlaceholder')}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs ml-1"
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
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-blue-600/25 transition-all"
            >
              <option value="ALL">{t('filterSemesterAll')}</option>
              <option value="Học kỳ II (2024-2025)">{t('filterSemester2')}</option>
              <option value="Học kỳ I (2024-2025)">{t('filterSemester1')}</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[17px] text-slate-400">
              expand_more
            </span>
          </div>

          {/* Instructor Filter */}
          <div className="relative">
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-blue-600/25 transition-all"
            >
              <option value="ALL">{t('filterInstructorAll')}</option>
              <option value="Nguyễn Văn An">TS. Nguyễn Văn An (Chủ nhiệm)</option>
              <option value="Lê Hoàng Nam">ThS. Lê Hoàng Nam</option>
              <option value="Đặng Minh Quân">TS. Đặng Minh Quân</option>
              <option value="Ban Giảng huấn">Ban Giảng huấn CNTT</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[17px] text-slate-400">
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
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-blue-600/25 transition-all"
            >
              <option value="progress">{t('sortProgress')}</option>
              <option value="code">{t('sortCode')}</option>
              <option value="name">{t('sortName')}</option>
              <option value="recent">{t('sortRecent')}</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[17px] text-slate-400">
              swap_vert
            </span>
          </div>
        </div>

        {/* View Mode Switcher & Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end">
          {/* Grid / List Switcher */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={t('viewGrid')}
            >
              <span className="material-symbols-outlined text-[19px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={t('viewList')}
            >
              <span className="material-symbols-outlined text-[19px]">view_list</span>
            </button>
          </div>

          {/* Primary Create CTA */}
          {currentRole === 'owner' && (
            <button
              type="button"
              onClick={onCreateNewClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-bold text-xs transition-all active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{t('createSubjectNewBtn')}</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. COURSES CONTAINER (Bento Grid or List Display) */}
      {filteredCourses.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 p-6 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">search_off</span>
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            Không tìm thấy môn học phù hợp
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc học kỳ, giảng viên.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSemesterFilter('ALL');
              setInstructorFilter('ALL');
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* BENTO GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => {
            const isCompleted = c.status === 'COMPLETED';
            const iconName = getSubjectIcon(c.code);

            return (
              <article
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 border-[3px] border-slate-300 dark:border-slate-700 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Top Gradient Banner */}
                  <div
                    className={`h-32 p-4 flex flex-col justify-between relative overflow-hidden ${
                      isCompleted
                        ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900'
                        : c.code.includes('301')
                        ? 'bg-gradient-to-r from-indigo-100 via-purple-100 to-blue-100 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900'
                        : 'bg-gradient-to-r from-blue-100 via-sky-100 to-indigo-100 dark:from-blue-950 dark:via-sky-950 dark:to-slate-900'
                    }`}
                  >
                    {/* Ambient Glow */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/40 dark:bg-white/5 blur-xl pointer-events-none" />

                    {/* Top Row: Code + Credits + More Vert Menu */}
                    <div className="flex items-center justify-between z-10 relative">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold tracking-wide shadow-xs">
                          {c.code}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-semibold shadow-xs">
                          {t('credits', { count: c.credits || 3 })}
                        </span>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === c.id ? null : c.id)
                          }
                          className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
                          title="Tùy chọn"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            more_vert
                          </span>
                        </button>

                        {activeMenuId === c.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-30 text-xs text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onAssignTeacherClick(c);
                                }}
                                className="w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  person_add
                                </span>
                                <span>Phân công giảng viên</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleTriggerAiExtract(c);
                                }}
                                className="w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  auto_awesome
                                </span>
                                <span>Bóc tách thực thể AI</span>
                              </button>
                              {currentRole === 'owner' && (
                                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onRemoveClick(c);
                                    }}
                                    className="w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      delete
                                    </span>
                                    <span>Gỡ khỏi lớp học</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Icon Box + Week/Status Pill */}
                    <div className="flex items-center gap-2 z-10">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[20px]">
                          {iconName}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 shadow-xs ${
                          isCompleted
                            ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-400">
                              check_circle
                            </span>
                            <span>{c.currentWeek || 'Đã hoàn thành'}</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>{c.currentWeek || 'Tuần 9/15'}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <h2
                        className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                        title={c.name}
                      >
                        {c.name}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400 text-xs">
                        <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                          person
                        </span>
                        <span className="font-medium truncate">
                          {c.instructorName || 'Chưa phân công'}
                        </span>
                      </div>
                    </div>

                    {/* 3-Column Stats Box */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                          {c.lecturesCount || c.studentsCount || c.chaptersCount || 24}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {c.studentsCount ? t('students') : t('lectures')}
                        </span>
                      </div>
                      <div className="flex flex-col border-x border-slate-200 dark:border-slate-700/60">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                          {c.knowledgeNodesCount || 115}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {t('knowledgeNodes')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                          {c.classAvgScore || c.quizzesCount || c.chaptersCount || 12}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {c.classAvgScore
                            ? t('classAvgScore')
                            : c.chaptersCount
                            ? t('chapters')
                            : t('quizzes')}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          {isCompleted ? t('completionProgress') : t('teachingProgress')}
                        </span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {c.teachingProgress || (isCompleted ? 100 : 50)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${c.teachingProgress || (isCompleted ? 100 : 50)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 gap-2">
                  {/* Left Special Feature Badge / Action */}
                  {c.specialFeature === 'Bóc tách AI' ? (
                    <button
                      type="button"
                      onClick={() => handleTriggerAiExtract(c)}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        auto_awesome
                      </span>
                      <span>{t('aiExtract')}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[15px]">
                        {c.specialFeatureIcon || 'auto_awesome'}
                      </span>
                      <span className="truncate">{c.specialFeature || 'Đồ thị tự chấm'}</span>
                    </span>
                  )}

                  {/* Right Action Button */}
                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={() => notify(`Xem hồ sơ lưu trữ môn ${c.name}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">summarize</span>
                      <span>{t('viewArchive')}</span>
                    </button>
                  ) : (
                    <Link
                      href={`/courses/${c.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                    >
                      <span>{t('enterSubject')}</span>
                      <span className="material-symbols-outlined text-[15px]">
                        arrow_forward
                      </span>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col gap-3">
          {filteredCourses.map((c) => {
            const isCompleted = c.status === 'COMPLETED';
            const iconName = getSubjectIcon(c.code);

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all border-[3px] border-slate-300 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">
                      {iconName}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-600 text-white">
                        {c.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {c.name}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {t('credits', { count: c.credits || 3 })}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                        {c.currentWeek || 'Tuần 9/15'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-blue-600">
                          person
                        </span>
                        {c.instructorName || 'Chưa phân công'}
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono">
                          {c.knowledgeNodesCount || 115}
                        </strong>{' '}
                        Node Tri thức
                      </span>
                      <span>•</span>
                      <span>
                        Tiến độ:{' '}
                        <strong className="text-blue-600 dark:text-blue-400 font-mono">
                          {c.teachingProgress || (isCompleted ? 100 : 50)}%
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  {c.specialFeature === 'Bóc tách AI' ? (
                    <button
                      type="button"
                      onClick={() => handleTriggerAiExtract(c)}
                      className="px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        auto_awesome
                      </span>
                      <span>Bóc tách AI</span>
                    </button>
                  ) : (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold hidden lg:inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">
                        {c.specialFeatureIcon || 'auto_awesome'}
                      </span>
                      <span>{c.specialFeature}</span>
                    </span>
                  )}

                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={() => notify(`Xem hồ sơ lưu trữ môn ${c.name}`)}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
                    >
                      {t('viewArchive')}
                    </button>
                  ) : (
                    <Link
                      href={`/courses/${c.id}`}
                      className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <span>{t('enterSubject')}</span>
                      <span className="material-symbols-outlined text-[15px]">
                        arrow_forward
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. SECTION: SHARED COURSE TEMPLATES (Kho Mẫu Học Liệu Dùng Chung) */}
      <section className="mt-8 flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">dataset</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('templatesSectionTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('templatesSectionDesc')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAllTemplatesOpen(true)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto"
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
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 border-[3px] border-slate-300 dark:border-slate-700 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                    {tpl.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {t('credits', { count: tpl.credits })}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-0.5 line-clamp-1">
                  {tpl.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-[16px]">
                    download_for_offline
                  </span>
                  <span>{t('timesUsed', { count: tpl.usedCount })}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCloneTemplate(tpl)}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 p-6 sm:p-7 max-w-3xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">dataset</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Kho Khung Môn Học &amp; Giáo Trình Chuẩn (28 Mẫu)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tương thích chuẩn ABET, Bộ GD&amp;ĐT và Chứng chỉ Quốc tế
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllTemplatesOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
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
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-all"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {tpl.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {tpl.credits} Tín chỉ
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {tpl.title}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {tpl.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCloneTemplate(tpl)}
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      content_copy
                    </span>
                    <span>Nhân bản vào lớp</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setIsAllTemplatesOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI ENTITY EXTRACTION SIMULATION */}
      {extractingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-md">
              <span className="material-symbols-outlined text-3xl animate-spin">
                sync
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Đang bóc tách thực thể AI...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Môn học: <strong className="text-slate-800 dark:text-slate-200">{extractingCourse.code} - {extractingCourse.name}</strong>
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-[11px] text-slate-400">
              Hệ thống đang trích xuất các Node Tri thức và ánh xạ vào Cây năng lực PLO.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
