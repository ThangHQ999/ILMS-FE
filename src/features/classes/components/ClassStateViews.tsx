'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { WorkspaceRoleMode } from '../types';

export function ClassLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-surface border border-border/70 p-0 overflow-hidden space-y-4 animate-pulse shadow-xs"
        >
          {/* Header Banner Skeleton */}
          <div className="h-36 w-full bg-muted/80 relative p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-5 w-20 bg-muted-foreground/20 rounded-md" />
              <div className="h-7 w-7 bg-muted-foreground/20 rounded-lg" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-36 bg-muted-foreground/20 rounded" />
              <div className="h-6 w-6 bg-muted-foreground/20 rounded-full" />
            </div>
          </div>

          {/* Body Skeleton */}
          <div className="p-5 pt-0 space-y-3.5">
            <div className="h-5 w-3/4 bg-muted-foreground/20 rounded-md" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
              <div className="h-4 w-16 bg-muted-foreground/20 rounded" />
            </div>
            <div className="h-4 w-1/2 bg-muted-foreground/20 rounded" />
            <div className="pt-3 border-t border-border/40 flex justify-between items-center">
              <div className="h-4 w-28 bg-muted-foreground/20 rounded" />
              <div className="h-8 w-24 bg-muted-foreground/20 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ClassEmptyStateProps {
  workspaceMode?: WorkspaceRoleMode;
  onCreateClick?: () => void;
  onJoinClick?: () => void;
}

export function ClassEmptyState({
  workspaceMode = 'faculty',
  onCreateClick,
  onJoinClick,
}: ClassEmptyStateProps) {
  const t = useTranslations('classes');

  return (
    <div className="my-8 p-12 rounded-2xl bg-surface border border-dashed border-border text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-inner">
        <span className="material-symbols-outlined text-[32px]">
          {workspaceMode === 'student' ? 'auto_stories' : 'school'}
        </span>
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg font-bold text-foreground font-display">
          {workspaceMode === 'student' ? t('emptyStudentTitle') : t('emptyActiveTitle')}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {workspaceMode === 'student' ? t('emptyStudentDesc') : t('emptyActiveDesc')}
        </p>
      </div>

      {workspaceMode === 'student' ? (
        <button
          type="button"
          onClick={onJoinClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 active:scale-95 text-primary-foreground text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">vpn_key</span>
          <span>{t('joinClassBtn')}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 active:scale-95 text-primary-foreground text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>{t('createClassBtn')}</span>
        </button>
      )}
    </div>
  );
}

interface ClassSearchNotFoundStateProps {
  onClearFilters: () => void;
}

export function ClassSearchNotFoundState({ onClearFilters }: ClassSearchNotFoundStateProps) {
  const t = useTranslations('classes');

  return (
    <div className="my-8 p-10 rounded-2xl bg-surface border border-border/80 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px]">search_off</span>
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-bold text-foreground font-display">
          {t('emptySearchTitle')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('emptySearchDesc')}
        </p>
      </div>
      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">restart_alt</span>
        <span>{t('clearFilters')}</span>
      </button>
    </div>
  );
}

export type StatePreviewType = 'normal' | 'skeleton' | 'empty' | 'notfound' | 'archived';

interface ClassStatePreviewSandboxProps {
  activeState: StatePreviewType;
  onSelectState: (state: StatePreviewType) => void;
}

export function ClassStatePreviewSandbox({
  activeState,
  onSelectState,
}: ClassStatePreviewSandboxProps) {
  const t = useTranslations('classes');

  const states: { id: StatePreviewType; label: string }[] = [
    { id: 'normal', label: t('stateNormal') },
    { id: 'skeleton', label: t('stateSkeleton') },
    { id: 'empty', label: t('stateEmpty') },
    { id: 'notfound', label: t('stateNotFound') },
    { id: 'archived', label: t('stateArchived') },
  ];

  return (
    <section className="p-5 rounded-2xl bg-surface border border-border/70 space-y-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            developer_mode
          </span>
          <h3 className="text-sm font-bold text-foreground">
            {t('statePreviewsTitle')}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('statePreviewsDesc')}
        </span>
      </div>

      {/* State Switcher Pills */}
      <div className="flex flex-wrap gap-2">
        {states.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => onSelectState(st.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeState === st.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>
    </section>
  );
}
