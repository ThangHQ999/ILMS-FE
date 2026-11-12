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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Avatar & Personal Info Card */}
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('profileHeaderTitle')}
          </h2>
          <p className="text-xs text-[#747775] dark:text-[#C4C7C5]">
            {t('profileHeaderSubtitle')}
          </p>
        </div>

        {/* Profile Photo Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl border-none">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center text-2xl font-bold shadow-none">
              {displayName.slice(0, 2).toUpperCase() || 'TM'}
            </div>
            <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[10px] font-bold rounded-full border-none">
              PRO
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center sm:items-start gap-1">
            <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {displayName || 'Trần Nhật Minh'}
            </span>
            <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
              {t('avatarFormatHint')}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={onSuccessToast}
                className="px-4 py-1.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium transition-all flex items-center gap-1 border-none shadow-none cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                {t('btnUploadPhoto')}
              </button>
              <button
                onClick={onSuccessToast}
                className="px-4 py-1.5 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#C4C7C5] text-xs font-medium transition-all border-none cursor-pointer"
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
            <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
              {t('lblDisplayName')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] outline-none transition-all"
            />
            <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">
              {t('hintDisplayName')}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
              {t('lblUsername')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#747775] dark:text-[#8E918F] text-xs">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-8 pr-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none font-mono text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none transition-all"
              />
            </div>
            <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">
              {t('hintUsername')}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
              {t('lblBirthDate')}
            </label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] outline-none transition-all"
            />
            <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">
              {t('hintBirthDate')}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
              {t('lblLearningRole')}
            </label>
            <input
              type="text"
              disabled
              value={profile?.role || 'Học viên Chuyên sâu (Advanced Track)'}
              className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-xs sm:text-sm text-[#747775] dark:text-[#8E918F] cursor-not-allowed opacity-80"
            />
            <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">
              {t('hintLearningRole')}
            </span>
          </div>
        </div>

        {/* Bio Textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
            {t('lblBio')}
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            className="w-full p-4 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] outline-none transition-all resize-none"
          />
          <div className="flex items-center justify-between text-[11px] text-[#747775] dark:text-[#8E918F]">
            <span>{t('hintBio')}</span>
            <span className="font-mono">{bio.length} / 300</span>
          </div>
        </div>
      </div>

      {/* 2. Contact Information Card */}
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('contactHeaderTitle')}
          </h2>
          <p className="text-xs text-[#747775] dark:text-[#C4C7C5]">
            {t('contactHeaderSubtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Email Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                    {profile?.email || 'nhatminh.edu@gmail.com'}
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[10px] font-bold flex items-center gap-0.5 border-none">
                    <span className="material-symbols-outlined text-[12px]">verified</span>{' '}
                    {t('badgeVerified')}
                  </span>
                </div>
                <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                  {t('hintPrimaryEmail')}
                </span>
              </div>
            </div>
            <button
              onClick={onSuccessToast}
              className="px-5 py-2 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-medium transition-colors self-start sm:self-auto border-none cursor-pointer"
              type="button"
            >
              {t('btnChangeEmail')}
            </button>
          </div>

          {/* Phone Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">call</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                    {profile?.phone || '+84 987 654 321'}
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[10px] font-bold flex items-center gap-0.5 border-none">
                    <span className="material-symbols-outlined text-[12px]">verified</span>{' '}
                    {t('badgeVerified')}
                  </span>
                </div>
                <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                  {t('hintPrimaryPhone')}
                </span>
              </div>
            </div>
            <button
              onClick={onSuccessToast}
              className="px-5 py-2 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-medium transition-colors self-start sm:self-auto border-none cursor-pointer"
              type="button"
            >
              {t('btnChangePhone')}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Password & Social Accounts */}
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('securityAccountsTitle')}
          </h2>
          <p className="text-xs text-[#747775] dark:text-[#C4C7C5]">
            {t('securityAccountsSubtitle')}
          </p>
        </div>

        {/* Change Password Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">password</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {t('lblAccountPassword')}
              </span>
              <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                {t('hintPasswordUpdated')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-5 py-2 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-medium transition-colors flex items-center gap-1 self-start sm:self-auto border-none cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            {t('btnChangePassword')}
          </button>
        </div>

        {/* Social Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Google */}
          <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1E1F20] border-none flex items-center justify-center text-sm font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                G
              </div>
              <span className="px-3 py-0.5 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[10px] font-bold border-none">
                {t('badgeLinked')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Google Account
              </span>
              <span className="text-[11px] text-[#747775] dark:text-[#8E918F] truncate">
                {profile?.socialAccounts.google?.email || 'nhatminh.edu@gmail.com'}
              </span>
            </div>
            <button
              onClick={onSuccessToast}
              className="w-full py-1.5 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#FAD2CF] hover:text-[#B3261E] dark:hover:bg-[#3C1919] dark:hover:text-[#F28B82] text-[#444746] dark:text-[#C4C7C5] text-xs font-medium transition-colors border-none cursor-pointer"
              type="button"
            >
              {t('btnUnlink')}
            </button>
          </div>

          {/* GitHub */}
          <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#1E1F20] dark:bg-[#131314] text-white flex items-center justify-center font-mono font-bold text-xs">
                &lt;/&gt;
              </div>
              <span className="px-3 py-0.5 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[10px] font-bold border-none">
                {t('badgeLinked')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                GitHub Dev
              </span>
              <span className="text-[11px] text-[#747775] dark:text-[#8E918F] font-mono">
                @{profile?.socialAccounts.github?.username || 'minh-dev-icpc'}
              </span>
            </div>
            <button
              onClick={onSuccessToast}
              className="w-full py-1.5 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#FAD2CF] hover:text-[#B3261E] dark:hover:bg-[#3C1919] dark:hover:text-[#F28B82] text-[#444746] dark:text-[#C4C7C5] text-xs font-medium transition-colors border-none cursor-pointer"
              type="button"
            >
              {t('btnUnlink')}
            </button>
          </div>

          {/* Apple ID */}
          <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">devices</span>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#1E1F20] text-[#747775] dark:text-[#8E918F] text-[10px] font-semibold border-none">
                {t('badgeUnlinked')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Apple ID
              </span>
              <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">
                {t('hintAppleLogin')}
              </span>
            </div>
            <button
              onClick={onSuccessToast}
              className="w-full py-1.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium transition-colors border-none shadow-none cursor-pointer"
              type="button"
            >
              {t('btnConnectNow')}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone Card */}
      <div className="bg-[#FAD2CF]/20 dark:bg-[#3C1919] p-6 rounded-3xl border-none shadow-none flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[#B3261E] dark:text-[#F28B82]">
          <span className="material-symbols-outlined text-[24px]">warning</span>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[#B3261E] dark:text-[#F28B82]">
              {t('dangerZoneTitle')}
            </h2>
            <p className="text-xs text-[#B3261E]/80 dark:text-[#F28B82]/80">
              {t('dangerZoneSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Action 1: Export Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1E1F20] border-none gap-3 shadow-none">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {t('exportDataTitle')}
              </span>
              <span className="text-[11px] text-[#747775] dark:text-[#C4C7C5]">
                {t('exportDataDesc')}
              </span>
            </div>
            <button
              onClick={handleExportData}
              className="px-5 py-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#C4C7C5] text-xs font-medium transition-colors flex items-center gap-1 self-start sm:self-auto border-none cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {t('btnExportData')}
            </button>
          </div>

          {/* Action 2: Deactivate */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1E1F20] border-none gap-3 shadow-none">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {t('deactivateTitle')}
              </span>
              <span className="text-[11px] text-[#747775] dark:text-[#C4C7C5]">
                {t('deactivateDesc')}
              </span>
            </div>
            <button
              onClick={onSuccessToast}
              className="px-5 py-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#C4C7C5] text-xs font-medium transition-colors self-start sm:self-auto border-none cursor-pointer"
              type="button"
            >
              {t('btnDeactivate')}
            </button>
          </div>

          {/* Action 3: Delete Permanent */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1E1F20] border-none gap-3 shadow-none">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#B3261E] dark:text-[#F28B82]">
                {t('deleteAccountTitle')}
              </span>
              <span className="text-[11px] text-[#747775] dark:text-[#C4C7C5]">
                {t('deleteAccountDesc')}
              </span>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-5 py-2 rounded-full bg-[#FAD2CF] hover:bg-[#F7BCB6] text-[#B3261E] dark:bg-[#3C1919] dark:hover:bg-[#4E2222] dark:text-[#F28B82] text-xs font-medium transition-colors self-start sm:self-auto border-none cursor-pointer"
              type="button"
            >
              {t('btnDeletePermanent')}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-xl px-6 py-3.5 rounded-full shadow-2xl border-none flex items-center justify-between">
        <span className="text-xs text-[#747775] dark:text-[#C4C7C5] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
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
            className="bg-transparent border border-[#747775] hover:bg-[#F0F4F9] text-[#1F1F1F] dark:border-[#8E918F] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] font-medium px-5 py-2.5 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer"
            type="button"
          >
            {t('btnDiscard')}
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50 border-none shadow-none cursor-pointer"
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
