'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLoginForm } from '../hooks/useLoginForm';
import { useOAuthLogin } from '../hooks/useOAuthLogin';
import { OAuthProvider } from '../types';

export function LoginForm() {
  const tAuth = useTranslations('auth');
  const tValidation = useTranslations('validation');
  const {
    formData,
    errors,
    showPassword,
    isLoading,
    handleChange,
    togglePasswordVisibility,
    handleLogin,
  } = useLoginForm();
  const { loginWithOAuth, loadingProvider } = useOAuthLogin();

  return (
    <div className="w-full max-w-md lg:max-w-lg mx-auto flex flex-col justify-center">
      <div className="bg-white dark:bg-[#161D2F]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,89,187,0.07),0_4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.6),0_0_25px_rgba(56,189,248,0.08)] border border-slate-200/60 dark:border-slate-700/60 relative">
        {/* Welcome Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-cyan-950/60 dark:border dark:border-cyan-500/25 dark:text-cyan-400 text-xs font-semibold w-fit mb-5 shadow-sm">
          <span className="material-symbols-outlined text-[16px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          <span>{tAuth('welcomeBadge')}</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {tAuth('heading')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {tAuth('description')}
          </p>
        </div>

        {errors.general && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {errors.general}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleLogin} noValidate>
          {/* Identifier Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between" htmlFor="login-identifier">
              <span>{tAuth('identifierLabel')}</span>
              <span className="text-xs text-slate-400">{tValidation('required')}</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 dark:text-cyan-400/80 text-[20px] pointer-events-none">
                mail
              </span>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                placeholder={tAuth('identifierPlaceholder')}
                disabled={isLoading}
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all outline-none focus:bg-white dark:focus:bg-[#111A30] focus:ring-2 focus:ring-blue-600 dark:focus:ring-cyan-400/40"
              />
            </div>
            {errors.identifier && <span className="text-xs text-red-500 mt-0.5">{errors.identifier}</span>}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="login-password">
              {tAuth('passwordLabel')}
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 dark:text-cyan-400/80 text-[20px] pointer-events-none">
                lock
              </span>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder={tAuth('passwordPlaceholder')}
                disabled={isLoading}
                className="w-full h-12 pl-11 pr-12 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all outline-none focus:bg-white dark:focus:bg-[#111A30] focus:ring-2 focus:ring-blue-600 dark:focus:ring-cyan-400/40"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={tAuth('togglePassword')}
                className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {errors.password && <span className="text-xs text-red-500 mt-0.5">{errors.password}</span>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600 dark:text-cyan-400 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="text-slate-600 dark:text-slate-400 font-medium">{tAuth('rememberMe')}</span>
            </label>
            <Link href="/forgot-password" className="text-blue-600 dark:text-cyan-400 hover:underline font-medium">
              {tAuth('forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-[#2563EB] dark:via-[#0284C7] dark:to-[#38BDF8] hover:brightness-110 active:scale-[0.99] text-white font-bold tracking-wide shadow-lg shadow-blue-600/25 dark:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-50"
          >
            <span>{isLoading ? tAuth('submitting') : tAuth('submitButton')}</span>
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-7 flex items-center justify-center">
          <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-700/60" />
          <span className="absolute px-3 bg-white dark:bg-[#161D2F] text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            {tAuth('quickLogin')}
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loadingProvider !== null || isLoading}
            onClick={() => loginWithOAuth('google')}
            className="h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loadingProvider === 'google' ? (
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            )}
            <span className="truncate">
              {loadingProvider === 'google' ? tAuth('connecting') : tAuth('googleLogin')}
            </span>
          </button>
          <button
            type="button"
            disabled={loadingProvider !== null || isLoading}
            onClick={() => loginWithOAuth('github')}
            className="h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loadingProvider === 'github' ? (
              <span className="w-4 h-4 border-2 border-slate-700 dark:border-white border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd" />
              </svg>
            )}
            <span className="truncate">
              {loadingProvider === 'github' ? tAuth('connecting') : tAuth('githubLogin')}
            </span>
          </button>
        </div>

        {/* Card Footer Register Link */}
        <div className="mt-8 pt-5 text-center bg-slate-50/80 dark:bg-[#0F172A]/70 border-t border-slate-200/80 dark:border-slate-800 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 md:-mx-10 md:-mb-10 rounded-b-2xl sm:rounded-b-3xl py-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tAuth('noAccountPrompt')}{' '}
            <Link href="/register" className="font-semibold text-blue-600 dark:text-cyan-400 hover:underline ml-1">
              {tAuth('registerNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
