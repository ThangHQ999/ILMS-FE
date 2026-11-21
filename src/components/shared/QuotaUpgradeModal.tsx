'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  QUOTA_EXCEEDED_EVENT,
  QuotaConfig,
  QuotaExceededDetail,
  QUOTA_ERRORS,
} from '@/constants/quota-limits';

export function QuotaUpgradeModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuota, setCurrentQuota] = useState<QuotaConfig>(QUOTA_ERRORS.COURSE_CREATION_LIMIT_REACHED);
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setCustomMessage(null);
  }, []);

  useEffect(() => {
    const handleQuotaExceeded = (e: Event) => {
      const customEvent = e as CustomEvent<QuotaExceededDetail>;
      if (customEvent?.detail) {
        const { config, message } = customEvent.detail;
        if (config) {
          setCurrentQuota(config);
        }
        if (message) {
          setCustomMessage(message);
        }
        setIsOpen(true);
      }
    };

    window.addEventListener(QUOTA_EXCEEDED_EVENT, handleQuotaExceeded);
    return () => {
      window.removeEventListener(QUOTA_EXCEEDED_EVENT, handleQuotaExceeded);
    };
  }, []);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const displayMessage = customMessage || currentQuota.message;

  const handleNavigateToPricing = () => {
    handleClose();
    router.push(currentQuota.link || '/pricing');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quota-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-[#3C4043] overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient gradient backdrop glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-amber-400/20 via-blue-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge & Close Button */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400">
              diamond
            </span>
            <span>Hạn mức gói cước • {currentQuota.badge}</span>
          </div>

          <button
            onClick={handleClose}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none"
            aria-label="Đóng cửa sổ"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Hero Icon & Title */}
        <div className="flex items-start gap-4 mt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B57D0] to-[#1A73E8] dark:from-[#1A73E8] dark:to-[#8AB4F8] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-[30px]">
              {currentQuota.icon || 'rocket_launch'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="quota-modal-title"
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight leading-snug"
            >
              {currentQuota.title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-[#C4C7C5] leading-relaxed">
              {displayMessage}
            </p>
          </div>
        </div>

        {/* Plan Upgrade Perks Card */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-[#162B4D]/60 dark:to-[#1E1F20] border border-blue-200/60 dark:border-blue-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Mở khóa với Gói cước Plus &amp; Pro</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-[#C4C7C5] leading-relaxed mb-3 font-medium">
            {currentQuota.benefitHighlight}
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-[#A8C7FA]">
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span>Hỏi Trợ lý AI không giới hạn</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span>50 GB Cloud Storage tốc độ cao</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span>Tạo môn học &amp; lớp học tối đa</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span>Đồ thị tri thức Neo4j toàn diện</span>
            </li>
          </ul>
        </div>

        {/* Action Button Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          {currentQuota.secondaryLink && currentQuota.secondaryActionText ? (
            <Link
              href={currentQuota.secondaryLink}
              onClick={handleClose}
              className="py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-slate-700 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors order-2 sm:order-1"
            >
              {currentQuota.secondaryActionText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none order-2 sm:order-1"
            >
              Để sau
            </button>
          )}

          <button
            type="button"
            onClick={handleNavigateToPricing}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#0B57D0] via-[#1A73E8] to-[#0B57D0] hover:from-[#0842A0] hover:to-[#1A73E8] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer border-none order-1 sm:order-2"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span>{currentQuota.actionText || 'Nâng cấp gói cước ngay'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
