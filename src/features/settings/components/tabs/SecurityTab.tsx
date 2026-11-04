'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  useSecuritySettings,
  useLogoutSession,
  useLogoutOtherSessions,
  useUpdatePrivacy,
} from '../../hooks/useSettings';

interface SecurityTabProps {
  onSuccessToast: () => void;
}

export function SecurityTab({ onSuccessToast }: SecurityTabProps) {
  const t = useTranslations('settings');
  const { data: security, isLoading } = useSecuritySettings();
  const logoutSessionMutation = useLogoutSession(onSuccessToast);
  const logoutOthersMutation = useLogoutOtherSessions(onSuccessToast);
  const updatePrivacyMutation = useUpdatePrivacy(onSuccessToast);

  if (isLoading || !security) {
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
            {t('securityHeaderTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('securityHeaderSubtitle')}
          </p>
        </div>

        {/* 2FA Active Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">security</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('twoFactorTitle')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  {t('badgeActive')}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('twoFactorDesc')}
              </span>
            </div>
          </div>
          <button
            onClick={onSuccessToast}
            className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
            type="button"
          >
            {t('btnReconfig2FA')}
          </button>
        </div>

        {/* Active Sessions Management */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('activeSessionsTitle')}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('activeSessionsDesc')}
              </span>
            </div>
            <button
              onClick={() => logoutOthersMutation.mutate()}
              disabled={logoutOthersMutation.isPending}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1 self-start sm:self-auto disabled:opacity-50"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              {t('btnLogoutAllOther')}
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex flex-col gap-2.5">
            {security.sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[22px]">
                      {session.device.includes('iPhone')
                        ? 'smartphone'
                        : 'laptop_mac'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {session.device}
                      </span>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">
                          {t('badgeCurrentDevice')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {session.location} • IP: {session.ip} • {session.lastActive}
                    </span>
                  </div>
                </div>

                {session.isCurrent ? (
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                ) : (
                  <button
                    onClick={() => logoutSessionMutation.mutate(session.id)}
                    className="text-rose-600 dark:text-rose-400 hover:underline text-xs font-semibold"
                    type="button"
                  >
                    {t('btnLogout')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Controls */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t('privacyTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('lblScoreVisibility')}
              </label>
              <select
                value={security.privacy.scoreVisibility}
                onChange={(e) =>
                  updatePrivacyMutation.mutate({
                    scoreVisibility: e.target.value as
                      | 'classmates_only'
                      | 'public'
                      | 'private',
                  })
                }
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="classmates_only">{t('optClassmatesOnly')}</option>
                <option value="public">{t('optPublic')}</option>
                <option value="private">{t('optPrivate')}</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('searchableByEmailTitle')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('searchableByEmailDesc')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={security.privacy.searchableByEmail}
                onChange={() =>
                  updatePrivacyMutation.mutate({
                    searchableByEmail: !security.privacy.searchableByEmail,
                  })
                }
                className="w-5 h-5 accent-secondary cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
