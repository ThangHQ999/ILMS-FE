'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCurrentUser, logout as authLogout } from '@/features/auth';
import { SubAccountItem } from '../types';

interface UserMenuDropdownProps {
  userFullName?: string;
  isFocus?: boolean;
}

const defaultSubAccounts: SubAccountItem[] = [
  {
    id: 'acc-school',
    fullName: 'Nhật Minh (Trường)',
    email: '20020123@vnu.edu.vn',
    initials: 'NM',
    avatarGradient: 'from-cyan-500 to-blue-600',
    status: 'active',
  },
  {
    id: 'acc-guest',
    fullName: 'Nguyễn Văn A',
    email: 'nva.test@gmail.com',
    initials: 'NA',
    avatarGradient: 'bg-amber-600',
    status: 'expired',
  },
];

export function UserMenuDropdown({
  userFullName = 'Nhật Minh',
  isFocus = false,
}: UserMenuDropdownProps) {
  const t = useTranslations('dashboard.userMenu');
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  const [isOpen, setIsOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [subAccounts, setSubAccounts] = useState<SubAccountItem[]>(defaultSubAccounts);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close when clicked outside or pressed ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const fullName =
    currentUser?.firstName || currentUser?.lastName
      ? `${currentUser.lastName || ''} ${currentUser.firstName || ''}`.trim()
      : userFullName;

  const email = currentUser?.email || 'nhatminh.edu@gmail.com';

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'NM';
  };

  const initials = getInitials(fullName);

  // Actions
  const handleLogout = async () => {
    try {
      await authLogout();
    } catch {
      // ignore
    } finally {
      setIsOpen(false);
      router.replace('/login');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await authLogout();
    } catch {
      // ignore
    } finally {
      setIsOpen(false);
      router.replace('/login');
    }
  };

  const handleSwitchAccount = (account: SubAccountItem) => {
    showToast(`${t('switchedTo')} ${account.fullName}`);
    setTimeout(() => {
      setIsOpen(false);
    }, 1200);
  };

  const handleRemoveAccount = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSubAccounts((prev) => prev.filter((acc) => acc.id !== id));
    showToast(t('accountRemoved'));
  };

  const handleRelogin = (e: React.MouseEvent, account: SubAccountItem) => {
    e.stopPropagation();
    setIsOpen(false);
    router.push(`/login?email=${encodeURIComponent(account.email)}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {isFocus ? (
        // Round button in Focus Mode
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 text-white font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all cursor-pointer hover:scale-105"
          title={fullName}
        >
          <span>{initials}</span>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
      ) : (
        // Pill button in Analytics Mode
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm group cursor-pointer"
          title={fullName}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white dark:ring-slate-900 font-semibold text-xs tracking-wide">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div className="hidden md:flex flex-col text-left mr-0.5">
            <span className="text-[13px] text-slate-900 dark:text-slate-100 font-semibold leading-tight truncate max-w-[120px]">
              {fullName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {t('proLearner')}
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          >
            expand_more
          </span>
        </button>
      )}

      {/* Floating Toast Notification inside Header */}
      {toastMessage && (
        <div className="absolute right-0 top-12 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-1.5 animate-fade-in whitespace-nowrap">
          <span className="material-symbols-outlined text-[16px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dropdown Panel (380px Width) */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2.5 rounded-3xl bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_6px_16px_rgba(0,0,0,0.08)] border border-slate-200 dark:border-slate-800 z-50 overflow-hidden transform transition-all duration-200 origin-top-right w-[calc(100vw-32px)] sm:w-[380px]"
        >
          {/* 1. User Profile Header with Large Avatar & Pro Badge */}
          <div className="p-5 flex flex-col items-center text-center bg-gradient-to-b from-blue-50/70 dark:from-blue-950/40 to-white dark:to-slate-900 relative">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-white dark:ring-slate-900">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 justify-center mb-0.5">
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {fullName}
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{email}</p>

            {/* Manage ILMS Account button */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition-colors mb-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-secondary">
                manage_accounts
              </span>
              <span>{t('manageAccount')}</span>
            </Link>

            {/* Switch / Select account accordion button */}
            <button
              type="button"
              onClick={() => setIsAccountsOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-secondary hover:bg-secondary/10 transition-colors cursor-pointer mt-1"
            >
              <span>{t('switchAccount')}</span>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                  isAccountsOpen ? 'rotate-180' : 'rotate-0'
                }`}
              >
                expand_more
              </span>
            </button>
          </div>

          {/* 2. Expandable Saved Accounts Section */}
          {isAccountsOpen && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/60 dark:bg-slate-800/40 transition-all">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('switchAccountTitle')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {t('subAccountsCount', { count: subAccounts.length })}
                </span>
              </div>

              <div className="space-y-1.5">
                {subAccounts.map((account) => {
                  const isExpired = account.status === 'expired';
                  return (
                    <div
                      key={account.id}
                      onClick={() => !isExpired && handleSwitchAccount(account)}
                      className={`p-2 rounded-2xl border transition-all ${
                        isExpired
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : 'hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer group'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full ${
                              account.avatarGradient?.startsWith('bg-')
                                ? account.avatarGradient
                                : `bg-gradient-to-tr ${account.avatarGradient || 'from-cyan-500 to-blue-600'}`
                            } text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}
                          >
                            {account.initials}
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-secondary transition-colors">
                                {account.fullName}
                              </span>
                              {isExpired && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                  {t('sessionExpired')}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {account.email}
                            </div>
                          </div>
                        </div>

                        {!isExpired ? (
                          <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-secondary group-hover:translate-x-0.5 transition-all mr-1">
                            arrow_forward
                          </span>
                        ) : null}
                      </div>

                      {isExpired && (
                        <div className="flex items-center justify-end gap-2 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={(e) => handleRelogin(e, account)}
                            className="px-3 py-1 rounded-full bg-secondary hover:bg-secondary/90 text-white text-[11px] font-semibold transition-colors shadow-sm cursor-pointer"
                          >
                            {t('loginBtn')}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveAccount(e, account.id)}
                            className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-slate-600 dark:text-slate-400 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            {t('deleteBtn')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Account & Sign Out All Accounts */}
              <div className="border-t border-slate-200/80 dark:border-slate-800 pt-1.5 mt-2 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/login?add_account=true');
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-xs text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  </div>
                  <span className="font-semibold">{t('addAnotherAccount')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutAll}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-rose-600 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                  </div>
                  <span className="font-semibold">{t('logoutAll')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Primary Logout Action */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 flex items-center justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer shadow-sm group"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                logout
              </span>
              <span>{t('logout')}</span>
            </button>
          </div>

          {/* 4. Privacy & Terms Footer */}
          <div className="py-2.5 px-4 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Link
                href="/privacy"
                onClick={() => setIsOpen(false)}
                className="hover:underline hover:text-slate-800 dark:hover:text-slate-200"
              >
                {t('privacyPolicy')}
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                onClick={() => setIsOpen(false)}
                className="hover:underline hover:text-slate-800 dark:hover:text-slate-200"
              >
                {t('termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
