'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ClassItem, WorkspaceRoleMode } from '../types';

interface ClassListViewProps {
  items: ClassItem[];
  workspaceMode?: WorkspaceRoleMode;
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export function ClassListView({
  items,
  workspaceMode = 'faculty',
  onArchiveClick,
  onRestoreClick,
  copiedCode,
  onCopyCode,
}: ClassListViewProps) {
  const t = useTranslations('classes');

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-surface border border-border/70 shadow-xs pt-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-foreground">
          <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
            <tr>
              <th className="px-5 py-3.5">{t('classCode')}</th>
              <th className="px-5 py-3.5">{t('classTitle')}</th>
              <th className="px-5 py-3.5">{t('schedule')}</th>
              <th className="px-5 py-3.5">
                {workspaceMode === 'student' ? t('learningProgress') : t('students')}
              </th>
              <th className="px-5 py-3.5">{t('enrollmentCode')}</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((item) => {
              const isCopied = copiedCode === item.enrollmentKey;
              const isArchived = item.status === 'ARCHIVED' || Boolean(item.deletedAt);
              const studentProgress = (item.name.charCodeAt(0) % 35) + 50;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Code */}
                  <td className="px-5 py-4 font-mono font-bold text-foreground">
                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                      {item.name}
                    </span>
                  </td>

                  {/* Title & Major */}
                  <td className="px-5 py-4 min-w-[200px]">
                    <Link
                      href={`/classes/${item.id}`}
                      prefetch={true}
                      className="font-semibold text-foreground hover:text-primary transition-colors block line-clamp-1"
                    >
                      {item.title || item.name}
                    </Link>
                    <span className="text-[11px] text-muted-foreground">
                      {item.major} • GV: {item.instructor?.fullName || 'TS. Lê Hoàng Nam'}
                    </span>
                  </td>

                  {/* Schedule */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="material-symbols-outlined text-[15px]">
                        schedule
                      </span>
                      <span>{item.schedule?.dayOfWeek || t('scheduleFlexible')}</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {item.schedule?.room || 'Trực tuyến'}
                      </span>
                    </div>
                  </td>

                  {/* Students / Progress */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {workspaceMode === 'student' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${studentProgress}%` }}
                          />
                        </div>
                        <span className="font-semibold text-primary font-mono">
                          {studentProgress}%
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">
                          {item.enrolledCount || 0}
                        </span>
                        <span className="text-muted-foreground"> / {item.maxStudents || 60}</span>
                      </>
                    )}
                  </td>

                  {/* Enrollment Key */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {item.enrollmentKey ? (
                      <button
                        type="button"
                        onClick={() => onCopyCode(item.enrollmentKey!)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 font-mono text-[11px] text-foreground transition-colors cursor-pointer"
                        title={t('copyCode')}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                        <span>{item.enrollmentKey}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/classes/${item.id}`}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold text-xs transition-colors"
                      >
                        {workspaceMode === 'student' ? t('continueLearning') : t('enterClassSpace')}
                      </Link>

                      {workspaceMode === 'faculty' && (
                        !isArchived ? (
                          <button
                            type="button"
                            onClick={() => onArchiveClick(item)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title={t('menuArchive')}
                          >
                            <span className="material-symbols-outlined text-[18px]">archive</span>
                          </button>
                        ) : (
                          onRestoreClick && (
                            <button
                              type="button"
                              onClick={() => onRestoreClick(item)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                              title={t('menuRestore')}
                            >
                              <span className="material-symbols-outlined text-[18px]">unarchive</span>
                            </button>
                          )
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
