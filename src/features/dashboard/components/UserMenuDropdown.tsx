'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCurrentUser, logout as authLogout } from '@/features/auth';
import { useUserRole } from '@/hooks/useUserRole';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
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
  const { roleBadge } = useUserRole();

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
      router.push('/login');
    }
  };

  const handleLogoutAll = async () => {
    showToast(t('loggingOutAll'));
    setTimeout(async () => {
      try {
        await authLogout();
      } catch {
        // ignore
      }
      setIsOpen(false);
      router.push('/login');
    }, 1000);
  };

  const handleSwitchAccount = (account: SubAccountItem) => {
    showToast(t('switchingAccount', { name: account.fullName }));
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
          className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 text-white font-bold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A8C7FA]/40 transition-transform cursor-pointer hover:scale-105 border-none"
          title={fullName}
        >
          <span>{initials}</span>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#81C995]" />
        </button>
      ) : (
        // Pill button in Analytics Mode
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] transition-colors bg-[#F0F4F9] dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3] group cursor-pointer border-none shadow-none"
          title={fullName}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#0D652D] dark:bg-[#81C995]" />
          </div>
          <div className="hidden md:flex flex-col text-left mr-0.5">
            <span className="text-[13px] text-[#1F1F1F] dark:text-[#E3E3E3] font-semibold leading-tight truncate max-w-[120px]">
              {fullName}
            </span>
            <span className="text-[10px] text-[#747775] dark:text-[#8E918F] font-medium">
              {roleBadge}
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-[18px] text-[#747775] dark:text-[#8E918F] group-hover:text-[#1F1F1F] dark:group-hover:text-[#E3E3E3] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          >
            expand_more
          </span>
        </button>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute right-0 top-12 z-50 bg-[#1E1F20] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-1.5 whitespace-nowrap border-none">
          <span className="material-symbols-outlined text-[16px] text-[#81C995]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dropdown Panel (380px Width) */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2.5 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-xl z-50 overflow-hidden transform transition-all duration-200 origin-top-right w-[calc(100vw-32px)] sm:w-[380px] border-none"
        >
          {/* 1. User Profile Header with Large Avatar & Pro Badge */}
          <div className="p-6 flex flex-col items-center text-center bg-white dark:bg-[#1E1F20]">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-none">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#0D652D] dark:bg-[#81C995] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[11px] font-bold">check</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 justify-center mb-1">
              <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3] leading-tight">
                {fullName}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] whitespace-nowrap border-none">
                {roleBadge}
              </span>
            </div>
            <p className="text-xs text-[#747775] dark:text-[#C4C7C5] mb-3">{email}</p>

            {/* Role Switcher for previewing teacher vs student view */}
            <div className="w-full mb-3">
              <RoleSwitcher />
            </div>

            {/* Manage Account button */}
            <Link
              href="/settings"
              prefetch={true}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors mb-2 cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                manage_accounts
              </span>
              <span>{t('manageAccount')}</span>
            </Link>

            {/* Switch / Select account accordion button */}
            <button
              type="button"
              onClick={() => setIsAccountsOpen((prev) => !prev)}
              className="text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1 cursor-pointer mt-1 border-none"
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
            <div className="px-4 py-3 bg-[#F0F4F9] dark:bg-[#282A2C]/40 transition-all border-none">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#747775] dark:text-[#8E918F]">
                  {t('switchAccountTitle')}
                </span>
                <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">
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
                      className={`p-2.5 rounded-2xl transition-colors border-none ${
                        isExpired
                          ? 'bg-white/60 dark:bg-[#131314]/60'
                          : 'hover:bg-white dark:hover:bg-[#1E1F20] cursor-pointer group'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
                              account.avatarGradient || 'from-slate-600 to-slate-800'
                            } text-white flex items-center justify-center font-bold text-xs shrink-0`}
                          >
                            {account.initials}
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                                {account.fullName}
                              </span>
                              {isExpired && (
                                <span className="rounded-full px-3 py-1 text-[10px] font-medium bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] whitespace-nowrap border-none">
                                  {t('sessionExpired')}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#747775] dark:text-[#C4C7C5] truncate">
                              {account.email}
                            </div>
                          </div>
                        </div>

                        {!isExpired ? (
                          <span className="material-symbols-outlined text-[16px] text-[#747775] dark:text-[#8E918F] group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors mr-1">
                            arrow_forward
                          </span>
                        ) : null}
                      </div>

                      {isExpired && (
                        <div className="flex items-center justify-end gap-2 mt-2 pt-2">
                          <button
                            type="button"
                            onClick={(e) => handleRelogin(e, account)}
                            className="bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium rounded-full px-4 py-1.5 text-xs whitespace-nowrap transition-colors cursor-pointer border-none shadow-none"
                          >
                            {t('loginBtn')}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveAccount(e, account.id)}
                            className="bg-transparent hover:bg-[#FAD2CF] text-[#B3261E] dark:hover:bg-[#3C1919] dark:text-[#F28B82] font-medium rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors cursor-pointer border-none"
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
              <div className="pt-1.5 mt-2 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/login?add_account=true');
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-xs text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#1E1F20] transition-all group cursor-pointer border-none"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] group-hover:bg-[#D3E3FD] dark:group-hover:bg-[#162B4D] group-hover:text-[#041E49] dark:group-hover:text-[#A8C7FA] transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  </div>
                  <span className="font-semibold">{t('addAnotherAccount')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutAll}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-xs text-[#444746] dark:text-[#C4C7C5] hover:text-[#B3261E] dark:hover:text-[#F28B82] hover:bg-[#FAD2CF]/50 dark:hover:bg-[#3C1919] transition-colors group cursor-pointer border-none"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] group-hover:bg-[#FAD2CF] dark:group-hover:bg-[#3C1919] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] group-hover:text-[#B3261E] dark:group-hover:text-[#F28B82] transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                  </div>
                  <span className="font-semibold">{t('logoutAll')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Primary Logout Action */}
          <div className="p-3 bg-white dark:bg-[#1E1F20] flex items-center justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:text-[#B3261E] dark:hover:text-[#F28B82] hover:bg-[#FAD2CF]/50 dark:hover:bg-[#3C1919] transition-all cursor-pointer group border-none whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px] text-[#747775] dark:text-[#8E918F] group-hover:text-[#B3261E] dark:group-hover:text-[#F28B82] transition-colors">
                logout
              </span>
              <span>{t('logout')}</span>
            </button>
          </div>

          {/* 4. Privacy & Terms Footer */}
          <div className="py-2.5 px-4 bg-[#F0F4F9] dark:bg-[#282A2C]/60 text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#747775] dark:text-[#C4C7C5]">
              <Link
                href="/privacy"
                onClick={() => setIsOpen(false)}
                className="hover:underline hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]"
              >
                {t('privacyPolicy')}
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                onClick={() => setIsOpen(false)}
                className="hover:underline hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]"
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
