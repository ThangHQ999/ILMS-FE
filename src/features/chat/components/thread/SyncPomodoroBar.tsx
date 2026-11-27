'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { StudyTimerAction, StudyTimerEvent } from '../../schemas/chat-phase2.schema';

interface SyncPomodoroBarProps {
  timer: StudyTimerEvent;
  isControlling?: boolean;
  onControl: (sessionId: string, action: StudyTimerAction, durationSeconds?: number) => void;
}

export function SyncPomodoroBar({
  timer,
  isControlling = false,
  onControl,
}: SyncPomodoroBarProps) {
  const tHeader = useTranslations('chat.header');
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (timer.phase === 'IDLE') {
      setRemainingSeconds(0);
      return;
    }

    const duration = timer.durationSeconds ?? 1500;
    if (timer.phase === 'PAUSED' || !timer.startedAt) {
      setRemainingSeconds(duration);
      return;
    }

    const startedMs = Date.parse(timer.startedAt);
    const serverNowMs = timer.serverNow ? Date.parse(timer.serverNow) : Date.now();
    const offsetMs = serverNowMs - Date.now();

    const tick = () => {
      const syncedNow = Date.now() + offsetMs;
      const elapsedSec = Math.max(0, Math.floor((syncedNow - startedMs) / 1000));
      setRemainingSeconds(Math.max(0, duration - elapsedSec));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  if (timer.phase === 'IDLE') return null;

  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');
  const isBreak = timer.phase === 'SHORT_BREAK';

  return (
    <div className="px-4 py-2 bg-[#D3E3FD]/60 dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-[18px] shrink-0">
          {isBreak ? 'coffee' : 'timer'}
        </span>
        <span className="font-semibold truncate">
          {isBreak ? tHeader('pomodoroBreak') : tHeader('pomodoroFocus')}:{' '}
          <strong className="font-mono text-sm tabular-nums">
            {mins}:{secs}
          </strong>
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {timer.phase !== 'PAUSED' ? (
          <button
            type="button"
            disabled={isControlling}
            onClick={() => onControl(timer.sessionId, 'PAUSE')}
            className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-[#1E1F20] text-[11px] font-semibold cursor-pointer"
          >
            {tHeader('pomodoroPause')}
          </button>
        ) : (
          <button
            type="button"
            disabled={isControlling}
            onClick={() => onControl(timer.sessionId, 'START_FOCUS', 1500)}
            className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-[#1E1F20] text-[11px] font-semibold cursor-pointer"
          >
            {tHeader('pomodoroResume')}
          </button>
        )}
        <button
          type="button"
          disabled={isControlling}
          onClick={() =>
            onControl(
              timer.sessionId,
              isBreak ? 'START_FOCUS' : 'START_BREAK',
              isBreak ? 1500 : 300
            )
          }
          className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-[#1E1F20] text-[11px] font-semibold cursor-pointer"
        >
          {isBreak ? tHeader('pomodoroFocusBtn') : tHeader('pomodoroBreakBtn')}
        </button>
        <button
          type="button"
          disabled={isControlling}
          onClick={() => onControl(timer.sessionId, 'RESET')}
          className="px-2 py-1 rounded-full hover:bg-white/60 dark:hover:bg-[#1E1F20]/60 text-[11px] cursor-pointer"
          title={tHeader('pomodoroReset')}
        >
          <span className="material-symbols-outlined text-[15px]">close</span>
        </button>
      </div>
    </div>
  );
}
