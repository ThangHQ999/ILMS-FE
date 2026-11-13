'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AssignmentItem } from '../types';

interface AssignmentActiveClusterProps {
  items: AssignmentItem[];
  onTakeQuiz?: (id: string) => void;
  onSubmitLab?: (id: string) => void;
  onViewClassScores?: (id: string) => void;
  onGradeSubmissions?: (id: string) => void;
}

export function AssignmentActiveCluster({
  items,
  onTakeQuiz,
  onSubmitLab,
  onViewClassScores,
  onGradeSubmissions,
}: AssignmentActiveClusterProps) {
  const t = useTranslations('assignments');

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Cluster Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            {t('clusters.activeTitle')}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-semibold">
            {items.length} {t('clusters.assignmentsCountSuffix')}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {t('clusters.priorityProcessing')}
        </span>
      </div>

      {/* List of active cards */}
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const isQuiz = item.type === 'QUIZ';
          const completionRate =
            item.totalStudents && item.totalStudents > 0
              ? Math.round(((item.submittedCount || 0) / item.totalStudents) * 100)
              : 0;

          return (
            <div
              key={item.id}
              className="w-full bg-card text-card-foreground rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md border border-border transition-all duration-200 relative group overflow-hidden"
            >
              {/* Left Accent indicator stripe */}
              <div
                className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  isQuiz ? 'bg-secondary' : 'bg-indigo-600'
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pl-2">
                <div className="flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        {isQuiz ? 'timer' : 'warning'}
                      </span>
                      {isQuiz ? t('status.opening') : t('status.dueSoon')}
                    </span>
                    {item.typeLabel && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                        {item.typeLabel}
                      </span>
                    )}
                    {item.chapter && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                        {item.chapter}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-secondary transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Extra metadata: Environment & Sample File for Lab */}
                  {item.environment && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted/60 text-foreground font-medium">
                        <span className="material-symbols-outlined text-[14px] text-secondary">
                          terminal
                        </span>
                        <span>{t('card.environment')}: {item.environment}</span>
                      </div>
                      {item.sampleFile && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted/60 text-foreground font-medium">
                          <span className="material-symbols-outlined text-[14px] text-secondary">
                            cloud_download
                          </span>
                          <span>
                            {t('card.sampleFile')}:{' '}
                            <span className="text-secondary font-semibold">
                              {item.sampleFile.name}
                            </span>{' '}
                            ({item.sampleFile.size})
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PLO Badges */}
                  {item.plos && item.plos.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {item.plos.map((plo) => (
                        <div
                          key={plo.code}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted/60 text-foreground text-xs font-medium"
                        >
                          <span className="material-symbols-outlined text-[14px] text-secondary">
                            verified
                          </span>
                          <strong>{plo.code}:</strong> {plo.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date & Remaining Alert Pill */}
                <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between gap-1 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <span className="material-symbols-outlined text-[15px]">alarm</span>
                    {item.timeRemainingLabel || t('status.twoDaysLeft')}
                  </div>
                  <span className="text-[11px] font-medium opacity-90">
                    {item.dueDateLabel}
                  </span>
                </div>
              </div>

              {/* Progress and Action Footer Bar */}
              <div className="mt-4 pt-3 bg-muted/20 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6 py-3 rounded-b-2xl border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-1 flex-wrap sm:flex-nowrap">
                  {/* Progress Bar */}
                  <div className="w-full max-w-[220px]">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
                      <span>
                        {isQuiz ? t('card.classCompleted') : t('card.submittedCount')}:{' '}
                        {item.submittedCount}/{item.totalStudents}
                      </span>
                      <span className="font-bold text-foreground">{completionRate}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isQuiz ? 'bg-secondary' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Class average score for Quiz */}
                  {typeof item.classAverageScore === 'number' && (
                    <div className="hidden sm:flex flex-col">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {t('card.classAverage')}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {item.classAverageScore} / 10
                      </span>
                    </div>
                  )}

                  {/* Pending grading badge for Lab */}
                  {typeof item.pendingGradingCount === 'number' && item.pendingGradingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-xs font-semibold">
                      {item.pendingGradingCount} {t('card.pendingGrading')}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isQuiz ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onViewClassScores?.(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">insights</span>
                        {t('actions.classScoreboard')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTakeQuiz?.(item.id)}
                        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs sm:text-sm font-bold hover:bg-secondary/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">play_circle</span>
                        {t('actions.startQuizNow')}
                      </button>
                    </>
                  ) : (
                    <>
                      {typeof item.pendingGradingCount === 'number' &&
                        item.pendingGradingCount > 0 && (
                          <button
                            type="button"
                            onClick={() => onGradeSubmissions?.(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            {t('actions.gradeSubmissions', { count: item.pendingGradingCount })}
                          </button>
                        )}
                      <button
                        type="button"
                        onClick={() => onSubmitLab?.(item.id)}
                        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs sm:text-sm font-bold hover:bg-secondary/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">upload_file</span>
                        {t('actions.submitLabReport')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

