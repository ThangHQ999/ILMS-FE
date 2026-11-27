'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useCreateStudySession } from '../../hooks/useChatPhase2';

interface CreateStudySessionModalProps {
  isOpen: boolean;
  conversationId: string;
  onClose: () => void;
}

const DURATION_PRESETS = [30, 60, 90, 120] as const;

export function CreateStudySessionModal({
  isOpen,
  conversationId,
  onClose,
}: CreateStudySessionModalProps) {
  const t = useTranslations('chat.drawer.sessions');
  const tCommon = useTranslations('chat.common');
  const createMutation = useCreateStudySession(conversationId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledStartAt, setScheduledStartAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingUrl, setMeetingUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScheduledStartAt('');
    setDurationMinutes(60);
    setMeetingUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledStartAt) return;
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledStartAt:
          scheduledStartAt.length === 16
            ? `${scheduledStartAt}:00`
            : scheduledStartAt,
        durationMinutes,
        meetingUrl: meetingUrl.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch {
      // Handled by useCreateStudySession.onError toast
    }
  };

  const isSubmitDisabled =
    createMutation.isPending || !title.trim() || !scheduledStartAt;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-study-session-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                calendar_clock
              </span>
            </div>
            <div className="min-w-0">
              <h3
                id="create-study-session-title"
                className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]"
              >
                {t('modalTitle')}
              </h3>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                {t('modalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon('close')}
            className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <label
              htmlFor="study-session-title"
              className="block font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]"
            >
              {t('titleLabel')}
            </label>
            <input
              id="study-session-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              className="w-full h-10 px-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="study-session-desc"
              className="block font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]"
            >
              {t('descLabel')}
            </label>
            <textarea
              id="study-session-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descPlaceholder')}
              className="w-full p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] outline-none resize-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="study-session-start"
                className="block font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]"
              >
                {t('startAtLabel')}
              </label>
              <input
                id="study-session-start"
                type="datetime-local"
                required
                value={scheduledStartAt}
                onChange={(e) => setScheduledStartAt(e.target.value)}
                className="w-full h-10 px-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="study-session-duration"
                className="block font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]"
              >
                {t('durationLabel')}
              </label>
              <input
                id="study-session-duration"
                type="number"
                min={15}
                max={480}
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(Math.max(15, Math.min(480, Number(e.target.value) || 60)))
                }
                placeholder={t('durationUnit')}
                className="w-full h-10 px-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {DURATION_PRESETS.map((minutes) => {
              const active = durationMinutes === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setDurationMinutes(minutes)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF]'
                      : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
                  }`}
                >
                  {t('durationMinutes', { minutes })}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="study-session-url"
              className="block font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]"
            >
              {t('meetingUrlLabel')}
            </label>
            <input
              id="study-session-url"
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder={t('meetingUrlPlaceholder')}
              className="w-full h-10 px-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] font-semibold cursor-pointer"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="px-5 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] font-semibold cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending ? t('creatingBtn') : t('submitCreateBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
