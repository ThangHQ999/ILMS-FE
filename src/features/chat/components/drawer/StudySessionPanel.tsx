'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  useRsvpStudySession,
  useStudySessions,
  useStudyTimer,
} from '../../hooks/useChatPhase2';
import type { StudySessionRsvpStatus } from '../../schemas/chat-phase2.schema';
import { CreateStudySessionModal } from '../modals/CreateStudySessionModal';

interface StudySessionPanelProps {
  conversationId: string;
}

export function StudySessionPanel({ conversationId }: StudySessionPanelProps) {
  const t = useTranslations('chat.drawer.sessions');
  const locale = useLocale();
  const { data: sessions = [], isLoading } = useStudySessions(conversationId, true);
  const rsvpMutation = useRsvpStudySession(conversationId);
  const timerMutation = useStudyTimer(conversationId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsCreateModalOpen(true)}
        className="w-full py-2 px-3 rounded-full bg-[#D3E3FD]/70 dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        <span>{t('createBtn')}</span>
      </button>

      {isLoading ? (
        <div className="h-16 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
      ) : sessions.length === 0 ? (
        <p className="text-xs text-center text-[#747775] dark:text-[#8E918F] py-3">
          {t('empty')}
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                    {session.title}
                  </p>
                  <p className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">
                    {new Date(session.scheduledStartAt).toLocaleString(
                      locale === 'en' ? 'en-US' : 'vi-VN'
                    )}{' '}
                    • {t('durationMinutes', { minutes: session.durationMinutes })}
                  </p>
                </div>
                {session.meetingUrl && (
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] text-[10px] font-semibold shrink-0"
                  >
                    {t('joinMeetingBtn')}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(['GOING', 'MAYBE', 'DECLINED'] as StudySessionRsvpStatus[]).map(
                  (status) => {
                    const label =
                      status === 'GOING'
                        ? `${t('rsvpGoing')} (${session.goingCount})`
                        : status === 'MAYBE'
                          ? `${t('rsvpMaybe')} (${session.maybeCount})`
                          : t('rsvpDeclined');
                    const active = session.myRsvp === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          rsvpMutation.mutate({ sessionId: session.id, status })
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
                          active
                            ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F]'
                            : 'bg-white dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  }
                )}
                <button
                  type="button"
                  onClick={() =>
                    timerMutation.mutate({
                      sessionId: session.id,
                      action: 'START_FOCUS',
                      durationSeconds: 1500,
                    })
                  }
                  className="ml-auto px-2.5 py-1 rounded-full bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">timer</span>
                  <span>{t('pomodoroBtn')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateStudySessionModal
        isOpen={isCreateModalOpen}
        conversationId={conversationId}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
