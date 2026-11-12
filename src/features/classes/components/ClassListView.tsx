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
    <div className="w-full overflow-hidden rounded-3xl bg-white dark:bg-[#1E1F20] pt-1 border-none shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#444746] dark:text-[#C4C7C5]">
          <thead className="bg-[#F0F4F9] dark:bg-[#282A2C]/60 text-[11px] font-semibold text-[#747775] dark:text-[#8E918F] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5 rounded-l-2xl">{t('classCode')}</th>
              <th className="px-5 py-3.5">{t('classTitle')}</th>
              <th className="px-5 py-3.5">{t('schedule')}</th>
              <th className="px-5 py-3.5">{t('students')}</th>
              <th className="px-5 py-3.5">{t('enrollmentCode')}</th>
              <th className="px-5 py-3.5 text-right rounded-r-2xl">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F9] dark:divide-[#282A2C]/50">
            {items.map((item) => {
              const isCopied = copiedCode === item.enrollmentKey;
              const isArchived = item.status === 'ARCHIVED';

              return (
                <tr
                  key={item.id}
                  className="hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]/40 transition-colors"
                >
                  {/* Code */}
                  <td className="px-5 py-4 font-mono font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                    <span className="px-2.5 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs">
                      {item.name}
                    </span>
                  </td>

                  {/* Title & Major */}
                  <td className="px-5 py-4 min-w-[200px]">
                    <Link
                      href={`/classes/${item.id}`}
                      prefetch={true}
                      className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors block line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">
                      {item.major} • {item.academicYear}
                    </span>
                  </td>

                  {/* Schedule */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[#444746] dark:text-[#C4C7C5]">
                      <span className="material-symbols-outlined text-[15px] text-[#0B57D0] dark:text-[#A8C7FA]">
                        schedule
                      </span>
                      <span>{item.schedule?.dayOfWeek || 'Linh hoạt'}</span>
                      <span className="text-[#747775] dark:text-[#8E918F]">•</span>
                      <span className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                        {item.schedule?.room || 'Phòng học trực tuyến'}
                      </span>
                    </div>
                  </td>

                  {/* Students */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {item.enrolledCount || 0}
                    </span>
                    <span className="text-[#747775] dark:text-[#8E918F]"> / {item.maxStudents || 60}</span>
                  </td>

                  {/* Enrollment Key */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {item.enrollmentKey ? (
                      <button
                        type="button"
                        onClick={() => onCopyCode(item.enrollmentKey!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] font-mono text-[11px] text-[#1F1F1F] dark:text-[#C4C7C5] whitespace-nowrap transition-colors border-none cursor-pointer"
                        title={t('copyCode')}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                        <span>{item.enrollmentKey}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/classes/${item.id}`}
                        className="px-4 py-1.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-xs whitespace-nowrap transition-colors border-none shadow-none"
                      >
                        {t('enterClassSpace')}
                      </Link>

                      {!isArchived ? (
                        <button
                          type="button"
                          onClick={() => onArchiveClick(item)}
                          className="p-1.5 rounded-full text-[#747775] dark:text-[#8E918F] hover:text-[#B3261E] dark:hover:text-[#F28B82] hover:bg-[#FAD2CF] dark:hover:bg-[#3C1919] transition-colors border-none cursor-pointer"
                          title={t('menuArchive')}
                        >
                          <span className="material-symbols-outlined text-[18px]">archive</span>
                        </button>
                      ) : (
                        onRestoreClick && (
                          <button
                            type="button"
                            onClick={() => onRestoreClick(item)}
                            className="p-1.5 rounded-full text-[#747775] dark:text-[#8E918F] hover:text-[#0D652D] dark:hover:text-[#81C995] hover:bg-[#C4EED0] dark:hover:bg-[#142E20] transition-colors border-none cursor-pointer"
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
