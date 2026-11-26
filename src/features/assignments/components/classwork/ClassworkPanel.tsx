'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { EmptyState, ErrorState } from '@/components/shared';
import { useScopedClasswork } from '../../hooks/useClasswork';
import { classworkTypeSchema } from '../../schemas/classwork.schema';
import { assignmentHref, assessmentPlayHref } from '../../utils/classworkRoutes';

interface ClassworkPanelProps {
  classId: string;
  courseId: string;
  canManage: boolean;
  fromCourse: boolean;
}

const TYPE_VISUALS: Record<
  string,
  { icon: string; tone: string; badge: string }
> = {
  NOTE: {
    icon: 'campaign',
    tone: 'bg-[#E9EEF6] text-[#1F1F1F] dark:bg-[#282A2C] dark:text-[#E3E3E3]',
    badge: 'bg-[#E9EEF6] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5]',
  },
  ASSIGNMENT: {
    icon: 'assignment',
    tone: 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF]',
    badge: 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF]',
  },
  QUIZ: {
    icon: 'quiz',
    tone: 'bg-[#C4EED0] text-[#072711] dark:bg-[#0F5223] dark:text-[#C4EED0]',
    badge: 'bg-[#C4EED0] text-[#072711] dark:bg-[#0F5223] dark:text-[#C4EED0]',
  },
  EXAM: {
    icon: 'fact_check',
    tone: 'bg-[#E8DEF8] text-[#1D192B] dark:bg-[#4A4458] dark:text-[#E8DEF8]',
    badge: 'bg-[#E8DEF8] text-[#1D192B] dark:bg-[#4A4458] dark:text-[#E8DEF8]',
  },
};

export function ClassworkPanel({
  classId,
  courseId,
  canManage,
  fromCourse,
}: ClassworkPanelProps) {
  const t = useTranslations('classworkFlow');
  const locale = useLocale();
  const [page, setPage] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setIsCreateOpen(false);
      }
    }
    if (isCreateOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isCreateOpen]);

  const query = useScopedClasswork(classId, courseId, canManage, page);
  const createPath = `/classes/${classId}/assignments/new`;
  const createParams = new URLSearchParams({ courseId });
  if (fromCourse) createParams.set('from', 'course');
  const items = query.data?.items ?? [];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedType !== 'ALL' && item.type !== selectedType) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = (item.description ?? '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [items, selectedType, search]);

  const hasFilters = selectedType !== 'ALL' || search.trim().length > 0;

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-busy={query.isFetching}>
      {/* Filter & Create Toolbar */}
      <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-4 shadow-sm dark:shadow-none flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] p-1">
          <button
            type="button"
            onClick={() => setSelectedType('ALL')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              selectedType === 'ALL'
                ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm'
                : 'text-[#444746] dark:text-[#C4C7C5]'
            }`}
          >
            Tất cả ({items.length})
          </button>
          {classworkTypeSchema.options.map((type) => {
            const count = items.filter((i) => i.type === type).length;
            const active = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm'
                    : 'text-[#444746] dark:text-[#C4C7C5]'
                }`}
              >
                {t(`types.${type}`)} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <span className="material-symbols-outlined text-[18px] text-[#444746] dark:text-[#C4C7C5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài tập, quiz..."
              className="w-full rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] pl-10 pr-4 py-2 text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
            />
          </div>

          {canManage && (
            <div ref={createMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsCreateOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2.5 text-sm font-medium text-white dark:text-[#062E6F] hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                {t('newWork')}
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>

              {isCreateOpen && (
                <ul className="absolute right-0 z-20 mt-2 w-72 rounded-3xl bg-white dark:bg-[#282A2C] p-2 shadow-xl">
                  {classworkTypeSchema.options.map((type) => {
                    const params = new URLSearchParams(createParams);
                    params.set('type', type === 'NOTE' ? 'NOTICE' : type);
                    const visual = TYPE_VISUALS[type] ?? TYPE_VISUALS.ASSIGNMENT;
                    return (
                      <li key={type}>
                        <Link
                          href={`${createPath}?${params}`}
                          onClick={() => setIsCreateOpen(false)}
                          className="flex items-start gap-3 rounded-2xl px-3.5 py-2.5 hover:bg-[#F0F4F9] dark:hover:bg-[#1E1F20] transition-colors"
                        >
                          <span
                            className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${visual.tone}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {visual.icon}
                            </span>
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                              {t(`types.${type}`)}
                            </span>
                            <span className="block text-xs text-[#444746] dark:text-[#C4C7C5]">
                              {t(`typeHints.${type}`)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {query.isPending && (
        <div className="space-y-3" role="status">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 animate-pulse rounded-3xl bg-white dark:bg-[#1E1F20]"
            />
          ))}
          <span className="sr-only">{t('loading')}</span>
        </div>
      )}

      {/* Error State */}
      {query.isError && (
        <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-8" role="alert">
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        </div>
      )}

      {/* Empty States */}
      {query.isSuccess && filteredItems.length === 0 && (
        <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-10 shadow-sm dark:shadow-none">
          {hasFilters ? (
            <EmptyState
              icon="filter_alt_off"
              title="Không tìm thấy nội dung phù hợp"
              description="Thử thay đổi từ khóa tìm kiếm hoặc chọn lại loại nội dung."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType('ALL');
                    setSearch('');
                  }}
                  className="rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-5 py-2 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF]"
                >
                  Đặt lại bộ lọc
                </button>
              }
            />
          ) : (
            <EmptyState
              icon="assignment"
              title={t('emptyWork')}
              description={
                canManage
                  ? 'Bắt đầu giao lời nhắn, bài tập tự luận, quiz hoặc bài kiểm tra cho lớp học.'
                  : 'Giảng viên chưa giao bài tập hay bài kiểm tra nào cho môn học này.'
              }
              action={
                canManage ? (
                  <Link
                    href={`${createPath}?${createParams.toString()}&type=ASSIGNMENT`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2.5 text-sm font-medium text-white dark:text-[#062E6F]"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Giao bài tập đầu tiên
                  </Link>
                ) : undefined
              }
            />
          )}
        </div>
      )}

      {/* List */}
      {filteredItems.length > 0 && (
        <ul
          className={`flex flex-col gap-3 transition-opacity ${
            query.isFetching ? 'opacity-70' : 'opacity-100'
          }`}
        >
          {filteredItems.map((item) => {
            const draft = item.publicationStatus === 'DRAFT';
            const editParams = new URLSearchParams(createParams);
            editParams.set('type', item.type === 'NOTE' ? 'NOTICE' : item.type);
            editParams.set('draftId', item.id);
            const quizHref = canManage
              ? `/assignments/analytics?${new URLSearchParams({ classId, quizId: item.id })}`
              : assessmentPlayHref(classId, item.assessmentId ?? item.id, 'QUIZ', courseId);
            const href =
              item.type === 'ASSIGNMENT'
                ? assignmentHref(classId, item.id)
                : item.type === 'EXAM'
                  ? canManage
                    ? `/classes/${classId}/exams/${item.id}?${new URLSearchParams({ courseId })}`
                    : assessmentPlayHref(classId, item.assessmentId ?? item.id, 'EXAM', courseId)
                  : item.type === 'QUIZ'
                    ? quizHref
                    : null;
            const date = item.dueDate ?? item.closesAt;
            const formattedDate = date
              ? new Date(date).toLocaleString(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : null;
            const visual = TYPE_VISUALS[item.type] ?? TYPE_VISUALS.ASSIGNMENT;

            return (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white dark:bg-[#1E1F20] p-5 shadow-sm dark:shadow-none"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div
                    className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center ${visual.tone}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {visual.icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-3 py-0.5 font-medium ${visual.badge}`}>
                        {t(`types.${item.type}`)}
                      </span>
                      {draft && (
                        <span className="rounded-full bg-[#FEEFC3] dark:bg-[#5C4300] px-2.5 py-0.5 font-medium text-[#4D3800] dark:text-[#FEEFC3]">
                          {t('draft')}
                        </span>
                      )}
                      {formattedDate && (
                        <time
                          dateTime={date ?? undefined}
                          className="inline-flex items-center gap-1 text-[#444746] dark:text-[#C4C7C5]"
                        >
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {t('dueAt', { date: formattedDate })}
                        </time>
                      )}
                    </div>

                    <h3 className="break-words text-base font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="whitespace-pre-wrap break-words text-sm text-[#444746] dark:text-[#C4C7C5] line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {item.fileAttachmentUrl && /^https?:\/\//i.test(item.fileAttachmentUrl) && (
                      <a
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline"
                        href={item.fileAttachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="material-symbols-outlined text-[15px]">attach_file</span>
                        {t('attachment')}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end shrink-0">
                  {canManage && draft ? (
                    <Link
                      href={`${createPath}?${editParams}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#FEEFC3] dark:bg-[#5C4300] px-4 py-2 text-sm font-medium text-[#4D3800] dark:text-[#FEEFC3] hover:opacity-90"
                    >
                      <span className="material-symbols-outlined text-[17px]">edit</span>
                      {t('editDraft')}
                    </Link>
                  ) : (
                    href &&
                    (!draft || canManage) && (
                      <Link
                        href={href}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-4 py-2 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF] hover:opacity-90"
                      >
                        {t('openWork')}
                        <span className="material-symbols-outlined text-[17px]">
                          arrow_forward
                        </span>
                      </Link>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {query.data && query.data.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-3xl bg-white dark:bg-[#1E1F20] px-5 py-3 text-xs text-[#444746] dark:text-[#C4C7C5]">
          <span>{t('page', { page: page + 1, total: query.data.totalPages })}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page === 0 || query.isFetching}
              className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-1.5 font-medium disabled:opacity-40"
            >
              {t('previous')}
            </button>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={query.data.isLast || query.isFetching}
              className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-1.5 font-medium disabled:opacity-40"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
