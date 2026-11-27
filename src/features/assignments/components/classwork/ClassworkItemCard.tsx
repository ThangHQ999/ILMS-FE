'use client';

import Link from 'next/link';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import type { ClassworkItem } from '../../schemas/classwork.schema';
import type { StudentClassworkGrade } from '../../utils/classworkGrades';
import { assignmentHref, assessmentPlayHref } from '../../utils/classworkRoutes';

export const TYPE_VISUALS: Record<
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

interface ClassworkItemCardProps {
  item: ClassworkItem;
  viewMode: 'grid' | 'list';
  canManage: boolean;
  classId: string;
  courseId: string;
  createPath: string;
  createParamsString: string;
  studentGrade: StudentClassworkGrade | null;
  isStudentGradeLoading: boolean;
}

function StudentScoreBadge({
  grade,
  isLoading,
}: {
  grade: StudentClassworkGrade | null;
  isLoading: boolean;
}) {
  const t = useTranslations('classworkFlow');
  const format = useFormatter();

  if (isLoading) {
    return (
      <span
        className="h-6 w-20 animate-pulse rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]"
        aria-hidden="true"
      />
    );
  }
  if (!grade) return null;

  if (grade.score != null) {
    const scoreText =
      grade.scoreMax != null
        ? t('score', {
            score: format.number(grade.score),
            max: format.number(grade.scoreMax),
          })
        : format.number(grade.score);

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#C4EED0] dark:bg-[#0F5223] px-3 py-1 text-xs font-semibold text-[#072711] dark:text-[#C4EED0] whitespace-nowrap">
        <span className="material-symbols-outlined text-[14px]">grade</span>
        {t('myScoreLabel')}: {scoreText}
      </span>
    );
  }

  const statusText = t.has(`gradeStatus.${grade.status}`)
    ? t(`gradeStatus.${grade.status}`)
    : t('gradeStatus.NO_SCORE');

  const isPendingReview =
    grade.status === 'SUBMITTED' || grade.status === 'PENDING_RELEASE';
  const isInProgress = grade.status === 'IN_PROGRESS';

  const toneClass = isPendingReview
    ? 'bg-[#FEEFC3] text-[#4D3800] dark:bg-[#5C4300] dark:text-[#FEEFC3]'
    : isInProgress
      ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF]'
      : 'bg-[#F0F4F9] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5]';
  const icon = isPendingReview
    ? 'hourglass_top'
    : isInProgress
      ? 'pending'
      : 'remove_circle_outline';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${toneClass}`}
    >
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {statusText}
    </span>
  );
}

export function ClassworkItemCard({
  item,
  viewMode,
  canManage,
  classId,
  courseId,
  createPath,
  createParamsString,
  studentGrade,
  isStudentGradeLoading,
}: ClassworkItemCardProps) {
  const t = useTranslations('classworkFlow');
  const locale = useLocale();

  const draft = item.publicationStatus === 'DRAFT';
  const editParams = new URLSearchParams(createParamsString);
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
  const showStudentScore = !canManage && item.type !== 'NOTE';

  const actionButton =
    canManage && draft ? (
      <Link
        href={`${createPath}?${editParams}`}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#FEEFC3] dark:bg-[#5C4300] px-4 py-2 text-sm font-medium text-[#4D3800] dark:text-[#FEEFC3] hover:opacity-90 whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-[17px]">edit</span>
        {t('editDraft')}
      </Link>
    ) : href && (!draft || canManage) ? (
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-4 py-2 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF] hover:opacity-90 whitespace-nowrap"
      >
        {t('openWork')}
        <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
      </Link>
    ) : null;

  const attachmentLink =
    item.fileAttachmentUrl && /^https?:\/\//i.test(item.fileAttachmentUrl) ? (
      <a
        className="inline-flex items-center gap-1 text-xs font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline w-fit"
        href={item.fileAttachmentUrl}
        target="_blank"
        rel="noreferrer"
      >
        <span className="material-symbols-outlined text-[15px]">attach_file</span>
        {t('attachment')}
      </a>
    ) : null;

  if (viewMode === 'grid') {
    return (
      <li className="flex flex-col justify-between gap-4 rounded-3xl bg-white dark:bg-[#1E1F20] p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-[#242628] transition-all">
        <div className="space-y-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
              <div
                className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center ${visual.tone}`}
              >
                <span className="material-symbols-outlined text-[22px]">{visual.icon}</span>
              </div>
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${visual.badge}`}>
                {t(`types.${item.type}`)}
              </span>
              {draft && (
                <span className="rounded-full bg-[#FEEFC3] dark:bg-[#5C4300] px-2.5 py-0.5 text-xs font-medium text-[#4D3800] dark:text-[#FEEFC3]">
                  {t('draft')}
                </span>
              )}
            </div>
            {showStudentScore && (
              <StudentScoreBadge grade={studentGrade} isLoading={isStudentGradeLoading} />
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <h3 className="break-words text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] line-clamp-2">
              {item.title}
            </h3>
            {item.description && (
              <p className="whitespace-pre-wrap break-words text-sm text-[#444746] dark:text-[#C4C7C5] line-clamp-2">
                {item.description}
              </p>
            )}
            {attachmentLink}
          </div>
        </div>

        <div className="pt-3 border-t border-[#E1E5EA]/70 dark:border-[#282A2C] flex items-center justify-between gap-2">
          {formattedDate ? (
            <time
              dateTime={date ?? undefined}
              className="inline-flex items-center gap-1 text-xs text-[#444746] dark:text-[#C4C7C5] min-w-0 truncate"
            >
              <span className="material-symbols-outlined text-[14px] shrink-0">schedule</span>
              <span className="truncate">{t('dueAt', { date: formattedDate })}</span>
            </time>
          ) : (
            <span />
          )}
          <div className="shrink-0">{actionButton}</div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white dark:bg-[#1E1F20] p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-[#242628] transition-all">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div
          className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center ${visual.tone}`}
        >
          <span className="material-symbols-outlined text-[22px]">{visual.icon}</span>
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
          {attachmentLink}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0">
        {showStudentScore && (
          <StudentScoreBadge grade={studentGrade} isLoading={isStudentGradeLoading} />
        )}
        {actionButton}
      </div>
    </li>
  );
}
