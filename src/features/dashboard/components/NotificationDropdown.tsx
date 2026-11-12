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
        className={`relative p-2 rounded-full transition-colors cursor-pointer border-none shadow-none ${
          isOpen
            ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
            : 'text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]'
        }`}
        type="button"
        title={t('notificationsTitle')}
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B3261E] dark:bg-[#F28B82] text-white dark:text-[#3C1919] text-[10px] font-bold flex items-center justify-center animate-pulse border-none shadow-none">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1E1F20] rounded-3xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 border-none">
          {/* Header Dropdown */}
          <div className="p-4 pb-3 flex items-center justify-between bg-white dark:bg-[#1E1F20]">
            <div className="flex items-center gap-2">
              <h3 className="text-base text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">
                {t('notificationsTitle')}
              </h3>
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] whitespace-nowrap border-none">
                  {t('newBadge', { count: unreadCount })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllAsRead}
                className="text-[#0B57D0] hover:bg-[#F0F4F9] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer border-none"
                title={t('markAllRead')}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>{t('markAllRead')}</span>
              </button>
              <button
                className="p-1.5 rounded-full text-[#747775] hover:text-[#1F1F1F] hover:bg-[#F0F4F9] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none"
                title={t('notificationSettings')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 bg-[#F0F4F9] dark:bg-[#1E1F20] flex items-center gap-1.5 overflow-x-auto scrollbar-none border-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap cursor-pointer border-none ${
                    isActive
                      ? 'font-medium bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] shadow-none'
                      : 'text-[#444746] hover:text-[#1F1F1F] hover:bg-[#E1E5EA] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] dark:hover:bg-[#282A2C]'
                  }`}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto overscroll-contain bg-white dark:bg-[#1E1F20]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#747775] dark:text-[#8E918F]">
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
                        ? 'bg-[#F0F4F9]/70 dark:bg-[#282A2C]/40 hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C]/70'
                        : 'hover:bg-[#F0F4F9]/50 dark:hover:bg-[#282A2C]/20 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.colorType === 'secondary'
                          ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                          : item.colorType === 'amber'
                          ? 'bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784]'
                          : 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                          {item.title}
                        </p>
                        {isUnread && (
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.colorType === 'secondary'
                                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
                                : item.colorType === 'amber'
                                ? 'bg-[#725200] dark:bg-[#FFB784]'
                                : 'bg-[#0D652D] dark:bg-[#81C995]'
                            }`}
                          />
                        )}
                      </div>
                      <p className="text-xs text-[#444746] dark:text-[#C4C7C5] line-clamp-2 leading-relaxed mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-normal text-[#747775] dark:text-[#8E918F] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>{' '}
                          {item.timeAgo}
                        </span>
                        {item.actionText && (
                          <button
                            className="bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium rounded-full px-3.5 py-1 text-xs whitespace-nowrap transition-colors inline-flex items-center gap-1 cursor-pointer border-none shadow-none"
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
          <div className="p-3 bg-[#F0F4F9] dark:bg-[#282A2C]/60 flex items-center justify-center border-none">
            <a
              className="text-[#0B57D0] hover:bg-[#E1E5EA] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1 border-none"
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
