'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import type { ShareableResourceItem, SharedResourceType } from '../../schemas/chat.schema';
import { useShareableResources } from '../../hooks/useChatMessages';

interface ShareResourcePickerModalProps {
  isOpen: boolean;
  classId?: string | null;
  courseId?: string | null;
  onClose: () => void;
  onSelect: (item: ShareableResourceItem) => Promise<void>;
}

const RESOURCE_FILTERS = [
  'ALL',
  'MATERIAL',
  'COURSE',
  'LESSON',
  'QUIZ',
  'ASSIGNMENT',
  'EXAM',
  'CONCEPT',
] as const;

export function ShareResourcePickerModal({
  isOpen,
  classId,
  courseId,
  onClose,
  onSelect,
}: ShareResourcePickerModalProps) {
  const t = useTranslations('chat.modals.share');
  const tMsg = useTranslations('chat.messages');
  const [type, setType] = useState('ALL');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 800);
  const isDebouncing = query.trim() !== debouncedQuery.trim();
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const { data: items = [], isLoading } = useShareableResources(
    {
      type,
      classId: classId || undefined,
      courseId: courseId || undefined,
      q: debouncedQuery.trim() || undefined,
    },
    isOpen
  );

  if (!isOpen) return null;

  const handlePick = async (item: ShareableResourceItem) => {
    setSubmittingId(item.resourceId);
    try {
      await onSelect(item);
      onClose();
    } finally {
      setSubmittingId(null);
    }
  };

  const iconFor = (rt: SharedResourceType) => {
    switch (rt) {
      case 'QUIZ':
        return 'quiz';
      case 'EXAM':
        return 'school';
      case 'ASSIGNMENT':
        return 'assignment';
      case 'COURSE':
        return 'menu_book';
      case 'LESSON':
        return 'play_lesson';
      case 'CONCEPT':
        return 'hub';
      default:
        return 'description';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full h-10 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {RESOURCE_FILTERS.map((key) => {
            const label =
              key === 'ASSIGNMENT'
                ? tMsg('resourceTypes.ASSIGNMENT')
                : t(`tabs.${key}`);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                  type === key
                    ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#A8C7FA] dark:text-[#062E6F]'
                    : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1.5">
          {isLoading || isDebouncing ? (
            <div className="space-y-2 py-2">
              <div className="h-14 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
              <div className="h-14 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-xs text-center text-[#747775] py-8">
              {t('empty')}
            </p>
          ) : (
            items.map((item) => (
              <button
                key={`${item.resourceType}-${item.resourceId}`}
                type="button"
                disabled={submittingId === item.resourceId}
                onClick={() => void handlePick(item)}
                className="w-full p-3 rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/60 hover:bg-[#D3E3FD]/50 dark:hover:bg-[#162B4D] flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[19px]">
                      {iconFor(item.resourceType)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#747775] dark:text-[#8E918F] truncate">
                      {tMsg(`resourceTypes.${item.resourceType}`)}
                      {item.subtitle ? ` • ${item.subtitle}` : ''}
                      {item.courseTitle ? ` • ${item.courseTitle}` : ''}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-[11px] font-semibold shrink-0">
                  {submittingId === item.resourceId ? t('sharingBtn') : t('shareBtn')}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
