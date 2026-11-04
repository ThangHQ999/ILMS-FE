'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSystemInfo } from '../../hooks/useSettings';

interface SupportTabProps {
  onSuccessToast: () => void;
}

export function SupportTab({ onSuccessToast }: SupportTabProps) {
  const t = useTranslations('settings');
  const { data: sysInfo, isLoading } = useSystemInfo();

  if (isLoading || !sysInfo) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('supportHeaderTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('supportHeaderSubtitle')}
          </p>
        </div>

        {/* Support Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                contact_support
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('helpCenterTitle')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('helpCenterDesc')}
              </span>
              <button
                onClick={onSuccessToast}
                className="text-secondary text-xs font-semibold hover:underline mt-1 flex items-center gap-1 self-start"
                type="button"
              >
                {t('btnOpenKnowledge')}{' '}
                <span className="material-symbols-outlined text-[14px]">
                  open_in_new
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                support_agent
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('chatSupportTitle')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('chatSupportDesc')}
              </span>
              <button
                onClick={onSuccessToast}
                className="text-secondary text-xs font-semibold hover:underline mt-1 flex items-center gap-1 self-start"
                type="button"
              >
                {t('btnConnectTechSupport')}{' '}
                <span className="material-symbols-outlined text-[14px]">chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Specs & Legal */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t('appInfoTitle')}
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t('lblAppVersion')}
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {sysInfo.appVersion}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t('lblServerStatus')}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />{' '}
                {t('serverOperational')} ({sysInfo.uptime})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t('lblPoliciesTerms')}
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/terms"
                  className="text-secondary hover:underline font-medium"
                >
                  {t('termsOfService')}
                </Link>
                <span className="text-slate-400">•</span>
                <Link
                  href="/privacy"
                  className="text-secondary hover:underline font-medium"
                >
                  {t('privacyPolicy')}
                </Link>
              </div>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 text-center mt-2">
            {t('copyrightNotice')}
          </span>
        </div>
      </div>
    </div>
  );
}
