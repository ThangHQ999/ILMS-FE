'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';
import { CustomSelect } from '@/components/shared';
import type { ClassCourse } from '../../schemas/class-detail.schema';
import type { AvailableClassCourse } from '../../services/class-detail.service';
import { CourseCard } from './CourseCard';

interface ClassSubjectsTabProps {
  courses: ClassCourse[];
  availableCourses?: AvailableClassCourse[];
  currentRole: 'owner' | 'teacher' | 'student';
  onAddExistingClick: () => void;
  onCreateNewClick: () => void;
  onAssignCourse?: (courseId: string) => void;
  onRemoveClick: (course: ClassCourse) => void;
  onAssignTeacherClick: (course: ClassCourse) => void;
  onToast?: (message: string) => void;
}

export function ClassSubjectsTab({
  courses: initialCourses,
  availableCourses = [],
  currentRole,
  onAddExistingClick,
  onCreateNewClick,
  onAssignCourse,
  onRemoveClick,
  onAssignTeacherClick,
  onToast,
}: ClassSubjectsTabProps) {
  const t = useTranslations('classes.detail');

  const [courseList, setCourseList] = useState<ClassCourse[]>(initialCourses);

  useEffect(() => {
    setCourseList(initialCourses);
  }, [initialCourses]);

  // Filters & Sorters
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [instructorFilter, setInstructorFilter] = useState('ALL');
  const [sortFilter, setSortFilter] = useState<'progress' | 'code' | 'name' | 'recent'>('progress');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isAllTemplatesOpen, setIsAllTemplatesOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [extractingCourse, setExtractingCourse] = useState<ClassCourse | null>(null);

  const filteredAvailableCourses = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return availableCourses;
    return availableCourses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.code && c.code.toLowerCase().includes(q))
    );
  }, [availableCourses, templateSearch]);

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

  // Assign shared/available course to class via API
  const handleAssignSharedCourse = (course: AvailableClassCourse) => {
    if (onAssignCourse) {
      onAssignCourse(course.id);
    } else {
      notify(`Đã thêm môn "${course.name}" vào lớp!`);
    }
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
          <CustomSelect<string>
            variant="pill"
            value={semesterFilter}
            onChange={(val) => setSemesterFilter(val)}
            options={[
              { value: 'ALL', label: t('filterSemesterAll') },
              { value: 'Học kỳ II (2024-2025)', label: t('filterSemester2') },
              { value: 'Học kỳ I (2024-2025)', label: t('filterSemester1') },
            ]}
            className="min-w-[160px]"
          />

          {/* Instructor Filter */}
          <CustomSelect<string>
            variant="pill"
            value={instructorFilter}
            onChange={(val) => setInstructorFilter(val)}
            options={[
              { value: 'ALL', label: t('filterInstructorAll') },
              { value: 'Nguyễn Văn An', label: 'TS. Nguyễn Văn An (Chủ nhiệm)' },
              { value: 'Lê Hoàng Nam', label: 'ThS. Lê Hoàng Nam' },
              { value: 'Đặng Minh Quân', label: 'TS. Đặng Minh Quân' },
              { value: 'Ban Giảng huấn', label: 'Ban Giảng huấn CNTT' },
            ]}
            className="min-w-[170px]"
          />

          {/* Sort Filter */}
          <CustomSelect<'progress' | 'code' | 'name' | 'recent'>
            variant="pill"
            value={sortFilter}
            onChange={(val) => setSortFilter(val)}
            options={[
              { value: 'progress', label: t('sortProgress') },
              { value: 'code', label: t('sortCode') },
              { value: 'name', label: t('sortName') },
              { value: 'recent', label: t('sortRecent') },
            ]}
            className="min-w-[150px]"
          />
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
                className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none border-2 border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:-translate-y-0.5 duration-200"
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
                          {c.studentsCount ?? 0}
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
            <span>{t('viewAllTemplates', { count: availableCourses.length })}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Shared / Available Courses Grid */}
        {availableCourses.length === 0 ? (
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#131314] text-center text-xs text-gray-500 dark:text-[#8E918F]">
            Không có môn học chuẩn dùng chung khả dụng nào để gán thêm vào lớp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {availableCourses.slice(0, 6).map((course) => {
              const bgUrl = course.backgroundUrl || course.thumbnailUrl;
              return (
                <div
                  key={course.id}
                  className="relative overflow-hidden p-5 rounded-2xl bg-gray-50 dark:bg-[#131314] hover:bg-gray-100/70 dark:hover:bg-[#282A2C] transition-all flex flex-col justify-between gap-4 border-none"
                >
                  {bgUrl && (
                    <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                      <img src={bgUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/85 to-white/65 dark:from-[#131314]/95 dark:via-[#131314]/85 dark:to-[#131314]/65" />
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] border-none">
                        {course.code}
                      </span>
                      <span className="font-mono text-xs font-semibold text-gray-500 dark:text-[#8E918F]">
                        {t('credits', { count: course.credits })}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mt-0.5 line-clamp-1">
                      {course.name}
                    </h4>

                    <p className="text-xs text-gray-500 dark:text-[#8E918F] line-clamp-2 leading-relaxed">
                      {course.description || 'Môn học chuẩn dùng chung trong hệ thống ILMS.'}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-[#8E918F] text-xs truncate">
                      <span className="material-symbols-outlined text-[16px]">
                        library_books
                      </span>
                      <span className="truncate">{course.instructorName || 'Môn dùng chung'}</span>
                    </div>

                    {currentRole !== 'student' && (
                      <button
                        type="button"
                        onClick={() => handleAssignSharedCourse(course)}
                        className="px-3.5 py-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] font-semibold text-xs transition-all inline-flex items-center gap-1.5 border-none cursor-pointer shrink-0"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>Thêm vào lớp</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL 1: VIEW ALL SHARED COURSES */}
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
                    Danh sách Môn học Chuẩn Dùng chung ({availableCourses.length})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                    Chọn môn học khả dụng từ hệ thống để gắn trực tiếp vào lớp học
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAllTemplatesOpen(false);
                  setTemplateSearch('');
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#282A2C] text-gray-500 dark:text-[#8E918F] flex items-center justify-center border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search bar */}
            <div className="relative shrink-0">
              <span className="material-symbols-outlined text-[18px] text-gray-400 dark:text-[#8E918F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên môn học hoặc mã môn..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-gray-100 dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border border-transparent focus:border-blue-500 dark:focus:border-[#A8C7FA] focus:outline-none transition-colors"
              />
              {templateSearch && (
                <button
                  type="button"
                  onClick={() => setTemplateSearch('')}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-gray-200 dark:hover:bg-[#282A2C] text-gray-400 flex items-center justify-center border-none bg-transparent cursor-pointer text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {availableCourses.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 dark:text-[#8E918F]">
                  Không có môn học khả dụng nào.
                </div>
              ) : filteredAvailableCourses.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                    Không tìm thấy môn học nào khớp với &ldquo;{templateSearch}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTemplateSearch('')}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] hover:opacity-85 border-none cursor-pointer"
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              ) : (
                filteredAvailableCourses.map((course) => {
                  const bgUrl = course.backgroundUrl || course.thumbnailUrl;
                  return (
                    <div
                      key={course.id}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gray-50 dark:bg-[#131314] border-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-100/70 transition-all"
                    >
                      {bgUrl && (
                        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                          <img src={bgUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/70 dark:from-[#131314]/95 dark:via-[#131314]/88 dark:to-[#131314]/70" />
                        </div>
                      )}
                      <div className="relative z-10 space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA]">
                            {course.code}
                          </span>
                          <span className="text-xs font-mono font-semibold text-gray-500">
                            {course.credits} Tín chỉ
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                          {course.name}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                          {course.description || 'Môn học chuẩn dùng chung trong hệ thống.'}
                        </p>
                      </div>
                      {currentRole !== 'student' && (
                        <button
                          type="button"
                          onClick={() => handleAssignSharedCourse(course)}
                          className="relative z-10 px-4 py-2 rounded-full bg-blue-100 dark:bg-[#A8C7FA] text-blue-900 dark:text-[#062E6F] font-semibold text-xs inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 border-none cursor-pointer hover:opacity-90"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          <span>Thêm vào lớp</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAllTemplatesOpen(false);
                  setTemplateSearch('');
                }}
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
