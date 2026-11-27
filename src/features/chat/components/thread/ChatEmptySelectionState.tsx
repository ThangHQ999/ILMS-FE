'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface ChatEmptySelectionStateProps {
  onOpenNewChat: () => void;
  onOpenStudyMatching: () => void;
}

export function ChatEmptySelectionState({
  onOpenNewChat,
  onOpenStudyMatching,
}: ChatEmptySelectionStateProps) {
  const t = useTranslations('chat.emptySelection');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center select-none">
      <div className="relative mb-5 flex items-center justify-center">
        {/* Soft ambient radial halo */}
        <div className="absolute w-32 h-32 rounded-full bg-[#D3E3FD]/55 dark:bg-[#0B57D0]/20 blur-2xl pointer-events-none" />

        {/* Soft-3D Messenger x Gemini MD3 speech bubble emblem */}
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          aria-hidden="true"
          className="relative drop-shadow-sm"
        >
          <defs>
            <linearGradient id="ilmsBubbleStroke" x1="16" y1="18" x2="80" y2="76" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E1E5EA" />
              <stop offset="100%" stopColor="#B8C4D4" />
            </linearGradient>
            <linearGradient id="ilmsBubbleFill" x1="18" y1="18" x2="78" y2="74" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F0F4F9" />
            </linearGradient>
          </defs>

          <path
            d="M48 16C28.1177 16 12 30.0583 12 47.4C12 56.6095 16.5441 64.8884 23.8294 70.6195C24.5136 71.1576 24.8321 72.0372 24.6512 72.8888L22.9765 80.7724C22.6419 82.3474 24.1977 83.6499 25.676 83.0309L34.7183 79.2449C35.3316 78.9881 36.0176 78.9437 36.6632 79.1194C40.2587 80.0978 44.0725 80.6 48 80.6C67.8823 80.6 84 66.5417 84 49.2C84 31.8583 67.8823 16 48 16Z"
            fill="url(#ilmsBubbleFill)"
            stroke="url(#ilmsBubbleStroke)"
            strokeWidth="3.5"
            className="dark:fill-[#282A2C] dark:stroke-[#444746]"
          />

          <circle cx="34" cy="48" r="5" className="fill-[#C4C7C5] dark:fill-[#5F6368]" />
          <circle cx="48" cy="48" r="5" className="fill-[#C4C7C5] dark:fill-[#5F6368]" />
          <circle cx="62" cy="48" r="5.5" className="fill-[#0B57D0] dark:fill-[#A8C7FA]" />

          {/* Subtle Socratic AI sparkle accent */}
          <path
            d="M78 14L79.8 18.6L84.4 20.4L79.8 22.2L78 26.8L76.2 22.2L71.6 20.4L76.2 18.6L78 14Z"
            className="fill-[#5E35B1] dark:fill-[#D1C4E9]"
          />
        </svg>
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
        {t('title')}
      </h2>
      <p className="mt-1.5 text-xs sm:text-sm text-[#444746] dark:text-[#8E918F] max-w-md leading-relaxed">
        {t('subtitle')}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={onOpenNewChat}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] text-white dark:text-[#062E6F] text-xs font-semibold cursor-pointer transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[17px]">edit_square</span>
          <span>{t('newMessageCta')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenStudyMatching}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-semibold cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[17px] text-[#0B57D0] dark:text-[#A8C7FA]">
            group_add
          </span>
          <span>{t('findStudyBuddyCta')}</span>
        </button>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#444746] dark:text-[#8E918F]">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9]/80 dark:bg-[#282A2C]/80">
          <span className="font-mono font-bold text-[#5E35B1] dark:text-[#D1C4E9]">@AI</span>
          <span>{t('tipAi')}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9]/80 dark:bg-[#282A2C]/80">
          <span className="font-mono font-bold text-[#0B57D0] dark:text-[#A8C7FA]">/share</span>
          <span>{t('tipShare')}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9]/80 dark:bg-[#282A2C]/80">
          <span className="font-mono font-bold text-[#0D652D] dark:text-[#81C995]">/poll</span>
          <span>{t('tipPoll')}</span>
        </span>
      </div>
    </div>
  );
}
