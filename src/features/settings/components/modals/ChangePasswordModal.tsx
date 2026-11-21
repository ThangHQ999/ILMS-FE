'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { changeUserPassword } from '../../services/settings.service';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const t = useTranslations('settings');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError(t('errCurrentPasswordRequired'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('errNewPasswordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('errPasswordMismatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      await changeUserPassword({ currentPassword, newPassword, confirmPassword });
      onSuccess();
      onClose();
    } catch {
      setError(t('errPasswordChangeFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1F20] border-none max-w-md w-full p-6 rounded-3xl shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">password</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {t('changePasswordTitle')}
              </h3>
              <p className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                {t('changePasswordSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#747775] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] p-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] text-xs border-none font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
              {t('lblCurrentPassword')}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
              {t('lblNewPassword')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
              {t('lblConfirmNewPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              onClick={onClose}
              type="button"
              className="bg-transparent border border-[#747775] hover:bg-[#F0F4F9] text-[#1F1F1F] dark:border-[#8E918F] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] font-medium px-5 py-2.5 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium whitespace-nowrap transition-colors border-none shadow-none cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  <span>{t('btnSaving')}</span>
                </>
              ) : (
                <span>{t('btnSubmitPassword')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
