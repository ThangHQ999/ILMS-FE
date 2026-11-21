'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TimetableExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'ics' | 'pdf') => void;
}

export function TimetableExportModal({
  isOpen,
  onClose,
  onExport,
}: TimetableExportModalProps) {
  const t = useTranslations('timetable.exportModal');
  const [selectedFormat, setSelectedFormat] = useState<'ics' | 'pdf'>('ics');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-3xl p-6 shadow-2xl border-none ring-0 outline-none transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA]">
              ios_share
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] font-sans">
              {t('title')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] flex items-center justify-center text-gray-600 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-[#C4C7C5] mb-4 font-sans">
          {t('description')}
        </p>

        {/* Format Selection Cards */}
        <div className="space-y-3 font-sans">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedFormat('ics')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedFormat('ics');
              }
            }}
            className={`p-4 rounded-2xl cursor-pointer transition-all border-none ring-0 outline-none flex items-start gap-3.5 ${
              selectedFormat === 'ics'
                ? 'bg-[#D3E3FD]/50 dark:bg-[#004A77]/40 ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]'
                : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200/70 dark:hover:bg-[#333538]'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#0B57D0] dark:text-[#C2E7FF] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#E3E3E3]">
                {t('icsOption')}
              </h4>
              <p className="text-xs text-gray-500 dark:text-[#C4C7C5] mt-0.5 leading-snug">
                {t('icsDesc')}
              </p>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedFormat('pdf')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedFormat('pdf');
              }
            }}
            className={`p-4 rounded-2xl cursor-pointer transition-all border-none ring-0 outline-none flex items-start gap-3.5 ${
              selectedFormat === 'pdf'
                ? 'bg-[#D3E3FD]/50 dark:bg-[#004A77]/40 ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]'
                : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200/70 dark:hover:bg-[#333538]'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FEEFC3] dark:bg-[#5C3B00] text-[#7A4100] dark:text-[#FFBA60] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#E3E3E3]">
                {t('pdfOption')}
              </h4>
              <p className="text-xs text-gray-500 dark:text-[#C4C7C5] mt-0.5 leading-snug">
                {t('pdfDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-3 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] text-xs font-semibold text-gray-800 dark:text-[#E3E3E3] transition-colors border-none cursor-pointer font-sans"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onExport(selectedFormat);
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:bg-[#0842a0] dark:hover:bg-[#8ab4f8] text-xs font-semibold flex items-center gap-1.5 shadow-sm dark:shadow-none transition-colors border-none cursor-pointer font-sans"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>{t('downloadBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

