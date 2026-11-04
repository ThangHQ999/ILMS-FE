'use client';

import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationTab } from '../types';

export function NotificationDropdown() {
  const t = useTranslations('dashboard');
  const {
    isOpen,
    toggleOpen,
    setIsOpen,
    activeTab,
    setActiveTab,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const tabs: { key: NotificationTab; label: string }[] = [
    { key: 'all', label: t('tabAll') },
    { key: 'unread', label: t('tabUnread', { count: unreadCount }) },
    { key: 'courses', label: t('tabCourses') },
    { key: 'ai', label: t('tabAI') },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-expanded={isOpen}
        onClick={toggleOpen}
        className={`relative p-2 rounded-lg transition-colors shadow-sm ${
          isOpen
            ? 'bg-secondary/10 text-secondary ring-2 ring-secondary/30'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        type="button"
        title={t('notificationsTitle')}
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Header Dropdown */}
          <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <h3 className="font-title-md text-base text-slate-900 dark:text-slate-100 font-semibold">
                {t('notificationsTitle')}
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary/15 text-secondary">
                  {t('newBadge', { count: unreadCount })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllAsRead}
                className="px-2 py-1 rounded-md text-xs font-medium text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-1"
                title={t('markAllRead')}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>{t('markAllRead')}</span>
              </button>
              <button
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t('notificationSettings')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors whitespace-nowrap ${
                    isActive
                      ? 'font-semibold bg-secondary text-white shadow-sm'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notification Items List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[380px] overflow-y-auto overscroll-contain bg-white dark:bg-slate-900">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('noNotifications')}
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.isRead;
                return (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-3.5 transition-colors flex items-start gap-3 relative group cursor-pointer ${
                      isUnread
                        ? item.colorType === 'secondary'
                          ? 'bg-secondary/10 hover:bg-secondary/15'
                          : item.colorType === 'amber'
                          ? 'bg-amber-50/50 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40'
                          : 'bg-emerald-50/40 hover:bg-emerald-50/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                        item.colorType === 'secondary'
                          ? 'bg-secondary/15 text-secondary'
                          : item.colorType === 'amber'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : item.colorType === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="font-label-md text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </p>
                        {isUnread && (
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.colorType === 'secondary'
                                ? 'bg-secondary'
                                : item.colorType === 'amber'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        )}
                      </div>
                      <p className="font-body-sm text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>{' '}
                          {item.timeAgo}
                        </span>
                        {item.actionText && (
                          <button
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-secondary text-white hover:opacity-90 shadow-sm inline-flex items-center gap-1 transition-colors"
                            type="button"
                          >
                            <span>{item.actionText}</span>
                            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Dropdown */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <a
              className="font-label-md text-xs font-semibold text-secondary hover:underline transition-colors inline-flex items-center gap-1"
              href="#"
            >
              <span>{t('viewAllNotifications')}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
