'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { KeyRound, Shield, CheckCircle2, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useResetPassword } from '../hooks/useResetPassword';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import type { PasswordStrength } from '../hooks/useRegisterForm';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const t = useTranslations('auth.resetPasswordPage');
  const tRegister = useTranslations('auth.register');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetMutation = useResetPassword({
    onSuccess: () => {
      onSuccess();
    },
  });

  const passwordStrength: PasswordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: tRegister('strengthEmpty'), isMax: false };
    let passedCriteria = 0;
    if (newPassword.length >= 8) passedCriteria += 1;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) passedCriteria += 1;
    if (/\d/.test(newPassword)) passedCriteria += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) passedCriteria += 1;

    let label = tRegister('strengthWeak');
    if (passedCriteria === 2) label = tRegister('strengthMedium');
    else if (passedCriteria === 3) label = tRegister('strengthStrong');
    else if (passedCriteria === 4) label = tRegister('strengthVeryStrong');

    return {
      score: passedCriteria,
      label,
      isMax: passedCriteria === 4,
    };
  }, [newPassword, tRegister]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    if (!token) {
      setValidationError(t('missingToken'));
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('validation.passwordMin8');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('validation.passwordMismatch');
      return;
    }

    resetMutation.mutate({
      token,
      newPassword,
      confirmPassword,
    });
  };

  const isPending = resetMutation.isPending;
  const apiError = resetMutation.error
    ? (resetMutation.error as Error).message || 'errors.serverError'
    : null;

  return (
    <div className="w-full">
      {/* Padlock Icon Badge */}
      <div className="relative w-14 h-14 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center mx-auto text-[#041E49] dark:text-[#A8C7FA] border-none shadow-none">
        <KeyRound className="w-7 h-7" />
      </div>

      {/* Heading & Subtext */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#E3E3E3] text-center mt-5 mb-2 tracking-tight">
        {t('formTitle')}
      </h1>
      <p className="text-sm text-slate-600 dark:text-[#C4C7C5] text-center px-1 mb-8 leading-relaxed">
        {t('formDescription')}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* New Password */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="new-password"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-[#C4C7C5] flex items-center gap-1.5"
            >
              <span>{t('newPasswordLabel')}</span>
            </label>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-[#041E49] dark:text-[#A8C7FA] bg-[#D3E3FD] dark:bg-[#162B4D] px-2.5 py-0.5 rounded-full border-none font-medium">
              <Shield className="w-3 h-3" />
              <span>{t('securityBadge')}</span>
            </span>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none text-slate-400 dark:text-[#8E918F]">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="new-password"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('newPasswordPlaceholder')}
              disabled={isPending}
              className="w-full h-12 bg-[#F0F4F9] dark:bg-[#282A2C] text-sm text-slate-900 dark:text-[#E3E3E3] pl-11 pr-11 rounded-full border-none outline-none transition-all focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label="Toggle password visibility"
              className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {newPassword.length > 0 && (
            <div className="pt-1">
              <PasswordStrengthMeter strength={passwordStrength} />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2 text-left">
          <label
            htmlFor="confirm-password"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-[#C4C7C5]"
          >
            {t('confirmPasswordLabel')}
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none text-slate-400 dark:text-[#8E918F]">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirmPasswordPlaceholder')}
              disabled={isPending}
              className="w-full h-12 bg-[#F0F4F9] dark:bg-[#282A2C] text-sm text-slate-900 dark:text-[#E3E3E3] pl-11 pr-11 rounded-full border-none outline-none transition-all focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
              className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Validation or API Errors */}
        {(validationError || apiError) && (
          <p className="text-xs text-[#B3261E] dark:text-[#F28B82] pt-1">
            {validationError || apiError}
          </p>
        )}

        {/* Format Hint */}
        <div className="flex items-start gap-1.5 pt-1 text-slate-500 dark:text-[#C4C7C5]">
          <CheckCircle2 className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 mt-0.5" />
          <span className="text-xs leading-normal">
            {t('formDescription')}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !newPassword || !confirmPassword}
          className="w-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-sm sm:text-base py-3.5 px-6 rounded-full border-none shadow-none transition-colors flex items-center justify-center gap-2 group mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('submitting')}</span>
            </>
          ) : (
            <span>{t('submitButton')}</span>
          )}
        </button>
      </form>
    </div>
  );
}
