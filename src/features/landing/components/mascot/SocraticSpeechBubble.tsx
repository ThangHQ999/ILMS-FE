'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export interface SocraticSpeechBubbleProps {
  badgeText: string;
  message: string;
  formula?: string;
  nextTipLabel?: string;
  onNextTip?: () => void;
  isAnimating?: boolean;
}

export function SocraticSpeechBubble({
  badgeText,
  message,
  formula,
  nextTipLabel,
  onNextTip,
  isAnimating = false,
}: SocraticSpeechBubbleProps) {
  return (
    <div
      className={`ilms-world-glass relative z-30 w-full max-w-md rounded-3xl p-4 sm:p-5 transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/12 dark:bg-sky-400/18 text-blue-800 dark:text-sky-200 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-300 animate-pulse" />
          <span>{badgeText}</span>
        </span>

        {onNextTip && nextTipLabel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNextTip();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 hover:bg-white dark:bg-white/10 dark:hover:bg-sky-400/25 text-slate-700 hover:text-blue-700 dark:text-sky-100 dark:hover:text-white text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{nextTipLabel}</span>
          </button>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-800 dark:text-sky-50 leading-relaxed font-medium">
        {message}
      </p>

      {formula && (
        <div className="mt-2.5 px-3.5 py-2 rounded-2xl bg-blue-950/8 dark:bg-slate-950/65 text-blue-800 dark:text-sky-300 font-mono text-xs sm:text-[13px] font-semibold tracking-wide overflow-x-auto">
          {formula}
        </div>
      )}
    </div>
  );
}
