'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AssignmentItem } from '../types';

interface AssignmentCompletedClusterProps {
  items: AssignmentItem[];
  onExportReport?: () => void;
  onReviewQuiz?: (id: string) => void;
  onPracticeMistakes?: (id: string) => void;
  onViewSubmission?: (id: string) => void;
}

export function AssignmentCompletedCluster({
  items,
  onExportReport,
  onReviewQuiz,
  onPracticeMistakes,
  onViewSubmission,
}: AssignmentCompletedClusterProps) {
  const t = useTranslations('assignments');

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Cluster Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">
            check_circle
          </span>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            {t('clusters.completedTitle')}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
            {items.length} {t('clusters.assignmentsCountSuffix')}
          </span>
        </div>
        <button
          type="button"
          onClick={onExportReport}
          className="text-xs font-semibold text-secondary hover:underline cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[15px]">download</span>
          {t('actions.exportPersonalTranscript')}
        </button>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const isQuiz = item.type === 'QUIZ';

          return (
            <div
              key={item.id}
              className="w-full bg-card text-card-foreground rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md border border-border transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Left Icon Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-secondary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[22px]">
                      {isQuiz ? 'quiz' : 'code'}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.typeLabel && (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-semibold">
                          {item.typeLabel}
                        </span>
                      )}
                      {item.submissionDate && (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {item.submissionDate}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-foreground truncate mt-1">
                      {item.title}
                    </h4>

                    {/* Quiz Metadata: Questions, Duration, Rank, Average */}
                    {isQuiz && (
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground mt-1">
                        {typeof item.questionsCount === 'number' && (
                          <span>{item.questionsCount} {t('card.questionsSuffix')}</span>
                        )}
                        {typeof item.durationMinutes === 'number' && (
                          <>
                            <span>•</span>
                            <span>{item.durationMinutes} {t('card.minutesSuffix')}</span>
                          </>
                        )}
                        {typeof item.classAverageScore === 'number' && (
                          <>
                            <span>•</span>
                            <span>
                              {t('card.classAvgShort')}: <strong>{item.classAverageScore}/10</strong>
                            </span>
                          </>
                        )}
                        {item.studentRank && (
                          <>
                            <span>•</span>
                            <span>
                              {t('card.rankShort')}:{' '}
                              <strong className="text-secondary">{item.studentRank}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Lab Teacher Feedback */}
                    {!isQuiz && item.teacherFeedback && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground italic">
                        <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">
                          chat_bubble_outline
                        </span>
                        <p className="truncate max-w-lg">{item.teacherFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="text-left md:text-right">
                    <div className="flex items-baseline md:justify-end gap-0.5">
                      <span className="text-xl sm:text-2xl font-bold text-foreground">
                        {item.studentScore}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">/10</span>
                    </div>
                    {item.ploAchievedLabel ? (
                      <p className="text-[11px] text-secondary font-semibold">
                        {item.ploAchievedLabel}
                      </p>
                    ) : item.scoreClassification ? (
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {item.scoreClassification}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isQuiz ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onPracticeMistakes?.(item.id)}
                          className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={t('actions.practiceMistakes')}
                          aria-label={t('actions.practiceMistakes')}
                        >
                          <span className="material-symbols-outlined text-[18px] text-secondary">
                            bolt
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onReviewQuiz?.(item.id)}
                          className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-secondary">
                            visibility
                          </span>
                          {t('actions.reviewAndExplain')}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onViewSubmission?.(item.id)}
                        className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          rate_review
                        </span>
                        {t('actions.viewSubmissionFeedback')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

