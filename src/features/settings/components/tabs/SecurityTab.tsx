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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('securityHeaderTitle')}
          </h2>
          <p className="text-xs text-[#747775] dark:text-[#C4C7C5]">
            {t('securityHeaderSubtitle')}
          </p>
        </div>

        {/* 2FA Active Banner */}
        <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">security</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {t('twoFactorTitle')}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[10px] font-bold border-none">
                  {t('badgeActive')}
                </span>
              </div>
              <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                {t('twoFactorDesc')}
              </span>
            </div>
          </div>
          <button
            onClick={onSuccessToast}
            className="px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#1E1F20] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium transition-colors border-none shadow-none cursor-pointer self-start sm:self-auto"
            type="button"
          >
            {t('btnReconfig2FA')}
          </button>
        </div>

        {/* Active Sessions Management */}
        <div className="pt-4 border-t border-[#F0F4F9] dark:border-[#282A2C] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {t('activeSessionsTitle')}
              </h3>
              <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                {t('activeSessionsDesc')}
              </span>
            </div>
            <button
              onClick={() => logoutOthersMutation.mutate()}
              disabled={logoutOthersMutation.isPending}
              className="px-5 py-2 rounded-full bg-[#FAD2CF] hover:bg-[#F7BCB6] text-[#B3261E] dark:bg-[#3C1919] dark:hover:bg-[#4E2222] dark:text-[#F28B82] text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50 border-none shadow-none cursor-pointer"
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
                className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1E1F20] border-none flex items-center justify-center text-[#1F1F1F] dark:text-[#E3E3E3] shadow-none shrink-0">
                    <span className="material-symbols-outlined text-[22px]">
                      {session.device.includes('iPhone')
                        ? 'smartphone'
                        : 'laptop_mac'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                        {session.device}
                      </span>
                      {session.isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[10px] font-bold border-none">
                          {t('badgeCurrentDevice')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#747775] dark:text-[#C4C7C5]">
                      {session.location} • IP: {session.ip} • {session.lastActive}
                    </span>
                  </div>
                </div>

                {session.isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D652D] dark:bg-[#81C995] shrink-0" />
                ) : (
                  <button
                    onClick={() => logoutSessionMutation.mutate(session.id)}
                    className="text-[#B3261E] dark:text-[#F28B82] hover:underline text-xs font-semibold border-none bg-transparent cursor-pointer"
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
        <div className="pt-4 border-t border-[#F0F4F9] dark:border-[#282A2C] flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('privacyTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
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
                className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] outline-none cursor-pointer transition-all"
              >
                <option value="classmates_only">{t('optClassmatesOnly')}</option>
                <option value="public">{t('optPublic')}</option>
                <option value="private">{t('optPrivate')}</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {t('searchableByEmailTitle')}
                </span>
                <span className="text-[11px] text-[#747775] dark:text-[#C4C7C5]">
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
                className="w-4 h-4 accent-[#0B57D0] dark:accent-[#A8C7FA] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
