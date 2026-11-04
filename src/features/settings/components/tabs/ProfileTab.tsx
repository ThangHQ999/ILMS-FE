'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useProfile, useUpdateProfile } from '../../hooks/useSettings';
import { ChangePasswordModal } from '../modals/ChangePasswordModal';
import { DeleteAccountModal } from '../modals/DeleteAccountModal';

interface ProfileTabProps {
  onSuccessToast: () => void;
}

export function ProfileTab({ onSuccessToast }: ProfileTabProps) {
  const t = useTranslations('settings');
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile(onSuccessToast);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bio, setBio] = useState('');

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setUsername(profile.username || '');
      setBirthDate(profile.birthDate || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      displayName,
      username,
      birthDate,
      bio,
    });
  };

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ilms_user_learning_profile.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onSuccessToast();
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Avatar & Personal Info Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('profileHeaderTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('profileHeaderSubtitle')}
          </p>
        </div>

        {/* Profile Photo Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {displayName.slice(0, 2).toUpperCase() || 'TM'}
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-primary dark:bg-secondary text-white text-[10px] font-bold rounded-full shadow-sm">
              PRO
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center sm:items-start gap-1">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {displayName || 'Trần Nhật Minh'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('avatarFormatHint')}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={onSuccessToast}
                className="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-all flex items-center gap-1 shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                {t('btnUploadPhoto')}
              </button>
              <button
                onClick={onSuccessToast}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                type="button"
              >
                {t('btnDeletePhoto')}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('lblDisplayName')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
            />
            <span className="text-[11px] text-slate-400">
              {t('hintDisplayName')}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('lblUsername')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 pl-7 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            </div>
            <span className="text-[11px] text-slate-400">
              {t('hintUsername')}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('lblBirthDate')}
            </label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
            />
            <span className="text-[11px] text-slate-400">
              {t('hintBirthDate')}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('lblLearningRole')}
            </label>
            <input
              type="text"
              disabled
              value={profile?.role || 'Học viên Chuyên sâu (Advanced Track)'}
              className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
            <span className="text-[11px] text-slate-400">
              {t('hintLearningRole')}
            </span>
          </div>
        </div>

        {/* Bio Textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('lblBio')}
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all resize-none"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('hintBio')}</span>
            <span className="font-mono">{bio.length} / 300</span>
          </div>
        </div>
      </div>

      {/* 2. Contact Information Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('contactHeaderTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('contactHeaderSubtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Email Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {profile?.email || 'nhatminh.edu@gmail.com'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">verified</span>{' '}
                    {t('badgeVerified')}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('hintPrimaryEmail')}
                </span>
              </div>
            </div>
            <button
              onClick={onSuccessToast}
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
              type="button"
            >
              {t('btnChangeEmail')}
            </button>
          </div>

          {/* Phone Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">call</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {profile?.phone || '+84 987 654 321'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">verified</span>{' '}
                    {t('badgeVerified')}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('hintPrimaryPhone')}
                </span>
              </div>
            </div>
            <button
              onClick={onSuccessToast}
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
              type="button"
            >
              {t('btnChangePhone')}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Password & Social Accounts */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('securityAccountsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('securityAccountsSubtitle')}
          </p>
        </div>

        {/* Change Password Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">password</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('lblAccountPassword')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('hintPasswordUpdated')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 self-start sm:self-auto"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            {t('btnChangePassword')}
          </button>
        </div>

        {/* Social Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Google */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold text-secondary shadow-xs">
                G
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">
                {t('badgeLinked')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Google Account
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {profile?.socialAccounts.google?.email || 'nhatminh.edu@gmail.com'}
              </span>
            </div>
            <button
              onClick={onSuccessToast}
              className="w-full py-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 hover:bg-rose-500/10 hover:text-rose-600 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors"
              type="button"
            >
              {t('btnUnlink')}
            </button>
          </div>

          {/* GitHub */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                &lt;/&gt;
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">
                {t('badgeLinked')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                GitHub Dev
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                @{profile?.socialAccounts.github?.username || 'minh-dev-icpc'}
              </span>
            </div>
            <button
              onClick={onSuccessToast}
              className="w-full py-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 hover:bg-rose-500/10 hover:text-rose-600 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors"
              type="button"
            >
              {t('btnUnlink')}
            </button>
          </div>

          {/* Apple ID */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[18px]">devices</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] font-semibold">
                {t('badgeUnlinked')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Apple ID
              </span>
              <span className="text-[11px] text-slate-400">
                {t('hintAppleLogin')}
              </span>
            </div>
            <button
              onClick={onSuccessToast}
              className="w-full py-1.5 rounded-lg bg-secondary text-white text-xs font-medium hover:bg-secondary/90 transition-colors shadow-xs"
              type="button"
            >
              {t('btnConnectNow')}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone Card */}
      <div className="bg-rose-500/5 dark:bg-rose-950/20 p-6 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/40 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <span className="material-symbols-outlined text-[24px]">warning</span>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
              {t('dangerZoneTitle')}
            </h2>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
              {t('dangerZoneSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Action 1: Export Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-3 shadow-xs">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('exportDataTitle')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('exportDataDesc')}
              </span>
            </div>
            <button
              onClick={handleExportData}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1 self-start sm:self-auto"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {t('btnExportData')}
            </button>
          </div>

          {/* Action 2: Deactivate */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-3 shadow-xs">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('deactivateTitle')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('deactivateDesc')}
              </span>
            </div>
            <button
              onClick={onSuccessToast}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors self-start sm:self-auto"
              type="button"
            >
              {t('btnDeactivate')}
            </button>
          </div>

          {/* Action 3: Delete Permanent */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 gap-3 shadow-xs">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {t('deleteAccountTitle')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('deleteAccountDesc')}
              </span>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors self-start sm:self-auto shadow-sm"
              type="button"
            >
              {t('btnDeletePermanent')}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            info
          </span>
          {t('stickySaveHint')}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (profile) {
                setDisplayName(profile.displayName);
                setUsername(profile.username);
                setBirthDate(profile.birthDate);
                setBio(profile.bio);
              }
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            type="button"
          >
            {t('btnDiscard')}
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="px-5 py-2 rounded-xl bg-secondary text-white text-xs font-bold shadow-md hover:bg-secondary/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {updateProfileMutation.isPending ? t('btnSaving') : t('btnSaveProfile')}
          </button>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={onSuccessToast}
      />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
