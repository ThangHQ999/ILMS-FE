'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ClassAnnouncement } from '../../schemas/class-detail.schema';

interface ClassAnnouncementsTabProps {
  announcements: ClassAnnouncement[];
  currentRole: 'owner' | 'teacher';
  onPostClick: () => void;
}

export function ClassAnnouncementsTab({
  announcements,
  currentRole,
  onPostClick,
}: ClassAnnouncementsTabProps) {
  const t = useTranslations('classes.detail');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('announcementsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('announcementsDesc')}
          </p>
        </div>
        <button
          type="button"
          onClick={onPostClick}
          className="px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[19px]">edit_note</span>
          <span>{t('postAnnouncementBtn')}</span>
        </button>
      </div>

      {/* Announcement Items List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm relative ${
              ann.isPinned
                ? 'border-2 border-blue-200 dark:border-blue-800'
                : 'border border-slate-200 dark:border-slate-800'
            }`}
          >
            {ann.isPinned && (
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-[13px]">push_pin</span>
                <span>{t('pinnedBadge')}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full text-white font-bold text-xs flex items-center justify-center flex-shrink-0 ${ann.authorColor}`}
                >
                  {ann.authorInitials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {ann.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {ann.authorName}
                    </span>{' '}
                    ({ann.authorRole})
                    <span>•</span>
                    <span>{ann.createdAt}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed sm:pl-13">
              {ann.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

