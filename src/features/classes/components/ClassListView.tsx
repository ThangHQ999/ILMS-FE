'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ClassItem } from '../types';

interface ClassListViewProps {
  items: ClassItem[];
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export function ClassListView({
  items,
  onArchiveClick,
  onRestoreClick,
  copiedCode,
  onCopyCode,
}: ClassListViewProps) {
  const t = useTranslations('classes');

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm pt-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3.5">{t('classCode')}</th>
              <th className="px-5 py-3.5">{t('classTitle')}</th>
              <th className="px-5 py-3.5">{t('schedule')}</th>
              <th className="px-5 py-3.5">{t('students')}</th>
              <th className="px-5 py-3.5">{t('enrollmentCode')}</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map((item) => {
              const isCopied = copiedCode === item.enrollmentKey;
              const isArchived = item.status === 'ARCHIVED';

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Code */}
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                      {item.name}
                    </span>
                  </td>

                  {/* Title & Major */}
                  <td className="px-5 py-4 min-w-[200px]">
                    <Link
                      href={`/classes/${item.id}`}
                      prefetch={true}
                      className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {item.major} • {item.academicYear}
                    </span>
                  </td>

                  {/* Schedule */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        schedule
                      </span>
                      <span>{item.schedule?.dayOfWeek || 'Linh hoạt'}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.schedule?.room || 'Phòng học trực tuyến'}
                      </span>
                    </div>
                  </td>

                  {/* Students */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.enrolledCount || 0}
                    </span>
                    <span className="text-slate-400"> / {item.maxStudents || 60}</span>
                  </td>

                  {/* Enrollment Key */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {item.enrollmentKey ? (
                      <button
                        type="button"
                        onClick={() => onCopyCode(item.enrollmentKey!)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 transition-colors"
                        title={t('copyCode')}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                        <span>{item.enrollmentKey}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/classes/${item.id}`}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white font-semibold text-xs transition-colors"
                      >
                        {t('enterClassSpace')}
                      </Link>

                      {!isArchived ? (
                        <button
                          type="button"
                          onClick={() => onArchiveClick(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title={t('menuArchive')}
                        >
                          <span className="material-symbols-outlined text-[18px]">archive</span>
                        </button>
                      ) : (
                        onRestoreClick && (
                          <button
                            type="button"
                            onClick={() => onRestoreClick(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title={t('menuRestore')}
                          >
                            <span className="material-symbols-outlined text-[18px]">unarchive</span>
                          </button>
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

