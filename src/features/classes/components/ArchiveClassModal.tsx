'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ClassItem } from '../types';
import { useArchiveClass } from '../hooks/useArchiveClass';

interface ArchiveClassModalProps {
  item: ClassItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArchiveClassModal({ item, isOpen, onClose }: ArchiveClassModalProps) {
  const t = useTranslations('classes');
  const { archiveClass, isArchiving } = useArchiveClass();

  if (!isOpen || !item) return null;

  const handleConfirm = async () => {
    try {
      await archiveClass(item.id);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl bg-surface border border-border/80 shadow-2xl p-6 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-modal-title"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">archive</span>
          </div>
          <div>
            <h3 id="archive-modal-title" className="text-base font-bold text-foreground">
              {t('modalArchiveTitle')}
            </h3>
            <p className="text-xs text-muted-foreground font-mono truncate max-w-[260px]">
              {item.name} — {item.title}
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {t('modalArchiveDesc')}
        </p>

        <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isArchiving}
            className="px-4 py-2 rounded-xl border border-border bg-surface text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
          >
            {t('btnCancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isArchiving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive hover:opacity-90 active:scale-95 disabled:opacity-50 text-destructive-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {isArchiving ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-destructive-foreground border-t-transparent animate-spin" />
                <span>{t('btnArchiving')}</span>
              </>
            ) : (
              <span>{t('btnConfirmArchive')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
