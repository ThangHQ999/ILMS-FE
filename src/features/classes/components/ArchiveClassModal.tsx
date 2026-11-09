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
    } catch (err) {
      // Error handled
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">archive</span>
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
              {t('modalArchiveTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {item.name} - {item.title}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('modalArchiveDesc')}
        </p>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isArchiving}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            {t('btnCancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isArchiving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {isArchiving ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
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

