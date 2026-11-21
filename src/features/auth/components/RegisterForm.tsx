'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { useOAuthLogin } from '../hooks/useOAuthLogin';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { OAuthProvider } from '../types';

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');
  const {
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    passwordStrength,
    isLoading,
    isSuccess,
    handleChange,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleRegister,
  } = useRegisterForm();
  const { loginWithOAuth, loadingProvider } = useOAuthLogin();

  return (
    <div className="w-full lg:col-span-7 flex flex-col justify-center">
      <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 md:p-10 shadow-none border-none transition-all duration-300">
        {/* Top Badge & Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs font-medium mb-3 border-none shadow-none">
            <span className="material-symbols-outlined text-[16px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <span>{t('badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#C4C7C5]">
            {t('subtitle')}
          </p>
        </div>

        {isSuccess && (
          <div role="status" className="mb-4 rounded-2xl bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] p-3 text-xs border-none">
            {t('successMessage')}
          </div>
        )}
        {errors.general && (
          <div role="alert" className="mb-4 rounded-2xl bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] p-3 text-xs border-none">
            {errors.general}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister} noValidate>
          {/* 1. Name Cluster: 3 Columns */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-[#E3E3E3] mb-1.5">
              {t('fullName')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t('lastNamePlaceholder')}
                  className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-900 dark:text-[#E3E3E3] text-sm border-none focus:outline-none transition-all"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                <span className="block mt-1 text-[11px] text-slate-400 px-2">{t('lastNameHint')}</span>
              </div>
              <div>
                <input
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder={t('middleNamePlaceholder')}
                  className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-900 dark:text-[#E3E3E3] text-sm border-none focus:outline-none transition-all"
                />
                <span className="block mt-1 text-[11px] text-slate-400 px-2">{t('middleNameHint')}</span>
              </div>
              <div>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('firstNamePlaceholder')}
                  className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-900 dark:text-[#E3E3E3] text-sm border-none focus:outline-none transition-all"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                <span className="block mt-1 text-[11px] text-slate-400 px-2">{t('firstNameHint')}</span>
              </div>
            </div>
          </div>

          {/* 2. Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-[#E3E3E3] mb-1.5" htmlFor="reg-email">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 material-symbols-outlined text-slate-400 text-[18px]">mail</span>
              <input
                id="reg-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('emailPlaceholder')}
                className="w-full h-11 pl-11 pr-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-900 dark:text-[#E3E3E3] text-sm border-none focus:outline-none transition-all"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* 3. Passwords & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-[#E3E3E3] mb-1.5" htmlFor="reg-pwd">
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                <input
                  id="reg-pwd"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full h-11 pl-11 pr-11 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-900 dark:text-[#E3E3E3] text-sm border-none focus:outline-none transition-all"
                />
                <button type="button" onClick={togglePasswordVisibility} aria-label={t('togglePassword')} className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-[#E3E3E3] mb-1.5" htmlFor="reg-cpwd">
                {t('confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 material-symbols-outlined text-slate-400 text-[18px]">lock_reset</span>
                <input
                  id="reg-cpwd"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="w-full h-11 pl-11 pr-11 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-900 dark:text-[#E3E3E3] text-sm border-none focus:outline-none transition-all"
                />
                <button type="button" onClick={toggleConfirmPasswordVisibility} aria-label={t('toggleConfirmPassword')} className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          <PasswordStrengthMeter strength={passwordStrength} />

          {/* 4. Terms */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded text-[#0B57D0] accent-[#0B57D0] dark:accent-[#A8C7FA] cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-[#C4C7C5] leading-relaxed">
                {t('termsPrefix')}{' '}
                <Link href="/terms" className="text-[#0B57D0] dark:text-[#A8C7FA] font-medium hover:underline">
                  {tCommon('terms')}
                </Link>{' '}
                {t('termsAnd')}{' '}
                <Link href="/privacy" className="text-[#0B57D0] dark:text-[#A8C7FA] font-medium hover:underline">
                  {tCommon('privacy')}
                </Link>{' '}
                {t('termsSuffix')}
              </span>
            </label>
            {errors.termsAccepted && <p className="mt-1 text-xs text-red-500">{errors.termsAccepted}</p>}
          </div>

          {/* 5. Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-sm border-none shadow-none transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? t('submitting') : t('submitButton')}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        {/* 6. Social Signup */}
        <div className="mt-6 pt-5 relative">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-full h-[1px] bg-[#E1E5EA] dark:bg-[#282A2C]" />
            <span className="absolute px-3 bg-white dark:bg-[#1E1F20] text-[11px] text-slate-400 font-medium tracking-wider uppercase">
              {t('quickRegister')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loadingProvider !== null || isLoading}
              onClick={() => loginWithOAuth('google')}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] border-none shadow-none text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loadingProvider === 'google' ? (
                <span className="w-4 h-4 border-2 border-[#0B57D0] border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              )}
              <span>{loadingProvider === 'google' ? tAuth('connecting') : 'Google'}</span>
            </button>
            <button
              type="button"
              disabled={loadingProvider !== null || isLoading}
              onClick={() => loginWithOAuth('github')}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] border-none shadow-none text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loadingProvider === 'github' ? (
                <span className="w-4 h-4 border-2 border-slate-700 dark:border-white border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd" />
                </svg>
              )}
              <span>{loadingProvider === 'github' ? tAuth('connecting') : 'GitHub'}</span>
            </button>
          </div>
        </div>

        {/* 7. Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-[#C4C7C5]">
            {t('hasAccountPrompt')}{' '}
            <Link href="/login" className="text-[#0B57D0] dark:text-[#A8C7FA] font-medium hover:underline">
              {t('loginNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
