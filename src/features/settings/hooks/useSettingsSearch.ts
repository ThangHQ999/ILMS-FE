'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SettingsTabId } from '../types';

const VALID_TAB_MAP: Record<string, SettingsTabId> = {
  profile: 'tab-profile',
  'tab-profile': 'tab-profile',
  appearance: 'tab-appearance',
  'tab-appearance': 'tab-appearance',
  notifications: 'tab-notifications',
  'tab-notifications': 'tab-notifications',
  security: 'tab-security',
  'tab-security': 'tab-security',
  billing: 'tab-billing',
  'tab-billing': 'tab-billing',
  support: 'tab-support',
  'tab-support': 'tab-support',
};

export function useSettingsSearch(defaultTab: SettingsTabId = 'tab-profile') {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTabState] = useState<SettingsTabId>(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && VALID_TAB_MAP[tabParam]) {
      return VALID_TAB_MAP[tabParam];
    }
    return defaultTab;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateTabUrl = useCallback((tabId: SettingsTabId) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const paramValue = tabId.replace('tab-', '');
      url.searchParams.set('tab', paramValue);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }, []);

  const handleSelectTab = useCallback(
    (tabId: SettingsTabId) => {
      setActiveTabState(tabId);
      updateTabUrl(tabId);
    },
    [updateTabUrl]
  );

  // Sync activeTab from URL search params when they change (e.g. back/forward or external navigation)
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && VALID_TAB_MAP[tabParam]) {
      setActiveTabState(VALID_TAB_MAP[tabParam]);
    } else if (!tabParam && typeof window !== 'undefined') {
      // Persist default tab in URL so refreshing (F5) stays on this tab
      const url = new URL(window.location.href);
      url.searchParams.set('tab', defaultTab.replace('tab-', ''));
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }, [searchParams, defaultTab]);

  // Scroll to targeted section (e.g. notification-channels)
  useEffect(() => {
    const section = searchParams?.get('section');
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    if (
      activeTab === 'tab-notifications' &&
      (section === 'notification-channels' || hash === '#notification-channels')
    ) {
      const timer = setTimeout(() => {
        const el = document.getElementById('notification-channels');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add(
            'ring-2',
            'ring-blue-500',
            'ring-offset-4',
            'dark:ring-offset-[#131314]'
          );
          setTimeout(() => {
            el.classList.remove(
              'ring-2',
              'ring-blue-500',
              'ring-offset-4',
              'dark:ring-offset-[#131314]'
            );
          }, 3000);
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [activeTab, searchParams]);

  // Toast controls
  const triggerSaveToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setShowSaveToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowSaveToast(false);
    }, 3500);
  }, []);

  const hideSaveToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setShowSaveToast(false);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Search logic that automatically routes to the best matching tab
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | string) => {
      const val = typeof e === 'string' ? e : e.target.value;
      setSearchQuery(val);
      const q = val.toLowerCase().trim();
      if (!q) return;

      if (
        q.includes('hồ sơ') ||
        q.includes('profile') ||
        q.includes('avatar') ||
        q.includes('ảnh') ||
        q.includes('email') ||
        q.includes('sđt') ||
        q.includes('phone') ||
        q.includes('tên') ||
        q.includes('bio') ||
        q.includes('xóa tài khoản') ||
        q.includes('danger')
      ) {
        handleSelectTab('tab-profile');
      } else if (
        q.includes('giao diện') ||
        q.includes('appearance') ||
        q.includes('tối') ||
        q.includes('sáng') ||
        q.includes('dark') ||
        q.includes('light') ||
        q.includes('ngôn ngữ') ||
        q.includes('múi giờ') ||
        q.includes('cỡ chữ') ||
        q.includes('phông') ||
        q.includes('font') ||
        q.includes('tương phản')
      ) {
        handleSelectTab('tab-appearance');
      } else if (
        q.includes('thông báo') ||
        q.includes('notification') ||
        q.includes('email') ||
        q.includes('sms') ||
        q.includes('push') ||
        q.includes('deadline') ||
        q.includes('nhắc nhở')
      ) {
        handleSelectTab('tab-notifications');
      } else if (
        q.includes('bảo mật') ||
        q.includes('security') ||
        q.includes('quyền riêng tư') ||
        q.includes('privacy') ||
        q.includes('mật khẩu') ||
        q.includes('password')
      ) {
        handleSelectTab('tab-security');
      } else if (
        q.includes('gói') ||
        q.includes('thanh toán') ||
        q.includes('billing') ||
        q.includes('visa') ||
        q.includes('pro') ||
        q.includes('hóa đơn') ||
        q.includes('vat') ||
        q.includes('dung lượng') ||
        q.includes('storage') ||
        q.includes('cloud')
      ) {
        handleSelectTab('tab-billing');
      } else if (
        q.includes('hỗ trợ') ||
        q.includes('trợ giúp') ||
        q.includes('help') ||
        q.includes('support') ||
        q.includes('cskh') ||
        q.includes('faq') ||
        q.includes('phiên bản') ||
        q.includes('version') ||
        q.includes('điều khoản')
      ) {
        handleSelectTab('tab-support');
      }
    },
    [handleSelectTab]
  );

  return {
    activeTab,
    setActiveTab: handleSelectTab,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    showSaveToast,
    triggerSaveToast,
    hideSaveToast,
  };
}
