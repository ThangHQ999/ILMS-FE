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
      className={`relative z-30 w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-xl p-4 sm:p-5 shadow-lg shadow-blue-950/10 dark:shadow-black/40 transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 animate-pulse" />
          <span>{badgeText}</span>
        </span>

        {onNextTip && nextTipLabel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNextTip();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 dark:bg-[#282A2C] dark:hover:bg-sky-500/20 text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-sky-300 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{nextTipLabel}</span>
          </button>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
        {message}
      </p>

      {formula && (
        <div className="mt-2.5 px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-[#131314] text-blue-700 dark:text-sky-300 font-mono text-xs sm:text-[13px] font-semibold tracking-wide overflow-x-auto">
          {formula}
        </div>
      )}
    </div>
  );
}
