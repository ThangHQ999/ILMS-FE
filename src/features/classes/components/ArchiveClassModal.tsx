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
      // Error handled
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] shadow-2xl p-6 space-y-4 border-none"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">archive</span>
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('modalArchiveTitle')}
            </h3>
            <p className="text-xs text-[#747775] dark:text-[#8E918F] font-mono">
              {item.name} - {item.title}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#444746] dark:text-[#C4C7C5] leading-relaxed">
          {t('modalArchiveDesc')}
        </p>

        <div className="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isArchiving}
            className="bg-transparent border border-[#747775] hover:bg-[#F0F4F9] text-[#1F1F1F] dark:border-[#8E918F] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] font-medium px-5 py-2.5 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            {t('btnCancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isArchiving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAD2CF] hover:bg-[#F7BCB6] text-[#B3261E] dark:bg-[#3C1919] dark:hover:bg-[#4E2222] dark:text-[#F28B82] text-xs font-medium whitespace-nowrap transition-colors border-none shadow-none cursor-pointer disabled:opacity-50"
          >
            {isArchiving ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
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
