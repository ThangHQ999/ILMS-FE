'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SettingsTabId } from '../types';

export function useSettingsSearch(defaultTab: SettingsTabId = 'tab-profile') {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Filter tabs automatically based on search query
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    const q = query.toLowerCase().trim();
    if (q.length < 2) return;

    if (
      q.includes('mật khẩu') ||
      q.includes('password') ||
      q.includes('profile') ||
      q.includes('hồ sơ') ||
      q.includes('tài khoản') ||
      q.includes('tên') ||
      q.includes('bio') ||
      q.includes('xóa tài khoản') ||
      q.includes('danger')
    ) {
      setActiveTab('tab-profile');
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
      q.includes('tương phản')
    ) {
      setActiveTab('tab-appearance');
    } else if (
      q.includes('thông báo') ||
      q.includes('notification') ||
      q.includes('email') ||
      q.includes('sms') ||
      q.includes('push') ||
      q.includes('deadline') ||
      q.includes('nhắc nhở')
    ) {
      setActiveTab('tab-notifications');
    } else if (
      q.includes('2fa') ||
      q.includes('bảo mật') ||
      q.includes('security') ||
      q.includes('phiên') ||
      q.includes('thiết bị') ||
      q.includes('session') ||
      q.includes('quyền riêng tư') ||
      q.includes('privacy')
    ) {
      setActiveTab('tab-security');
    } else if (
      q.includes('gói') ||
      q.includes('thanh toán') ||
      q.includes('billing') ||
      q.includes('visa') ||
      q.includes('pro') ||
      q.includes('hóa đơn') ||
      q.includes('vat') ||
      q.includes('dung lượng') ||
      q.includes('storage')
    ) {
      setActiveTab('tab-billing');
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
      setActiveTab('tab-support');
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    showSaveToast,
    triggerSaveToast,
    hideSaveToast,
  };
}
