'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { SettingsTabId } from '../types';

interface SettingsSearchDescriptor {
  id: string;
  key:
    | 'profileInfo'
    | 'profileDanger'
    | 'appearanceTheme'
    | 'appearanceFont'
    | 'appearanceLocale'
    | 'notificationsChannels'
    | 'securityPassword'
    | 'securityPrivacy'
    | 'billingPlan'
    | 'billingStorage'
    | 'billingHistory'
    | 'supportFaq';
  tabId: SettingsTabId;
  icon: string;
}

interface SettingsSearchItem extends SettingsSearchDescriptor {
  tabLabel: string;
  title: string;
  description: string;
  keywords: string;
}

const SETTINGS_SEARCH_DESCRIPTORS: SettingsSearchDescriptor[] = [
  { id: 'profile-info', key: 'profileInfo', tabId: 'tab-profile', icon: 'person' },
  { id: 'profile-danger', key: 'profileDanger', tabId: 'tab-profile', icon: 'delete_forever' },
  { id: 'appearance-theme', key: 'appearanceTheme', tabId: 'tab-appearance', icon: 'dark_mode' },
  { id: 'appearance-font', key: 'appearanceFont', tabId: 'tab-appearance', icon: 'text_fields' },
  { id: 'appearance-locale', key: 'appearanceLocale', tabId: 'tab-appearance', icon: 'translate' },
  { id: 'notifications-channels', key: 'notificationsChannels', tabId: 'tab-notifications', icon: 'notifications_active' },
  { id: 'security-password', key: 'securityPassword', tabId: 'tab-security', icon: 'lock_reset' },
  { id: 'security-privacy', key: 'securityPrivacy', tabId: 'tab-security', icon: 'visibility' },
  { id: 'billing-plan', key: 'billingPlan', tabId: 'tab-billing', icon: 'workspace_premium' },
  { id: 'billing-storage', key: 'billingStorage', tabId: 'tab-billing', icon: 'cloud' },
  { id: 'billing-history', key: 'billingHistory', tabId: 'tab-billing', icon: 'receipt_long' },
  { id: 'support-faq', key: 'supportFaq', tabId: 'tab-support', icon: 'help' },
];

function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

interface SettingsHeaderProps {
  userFullName?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTab?: (tabId: SettingsTabId) => void;
}

export function SettingsHeader({
  userFullName = '',
  searchQuery,
  onSearchChange,
  onSelectTab,
}: SettingsHeaderProps) {
  const t = useTranslations('settings');
  const tSearch = useTranslations('settings.searchIndex');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const searchItems = useMemo<SettingsSearchItem[]>(() => {
    return SETTINGS_SEARCH_DESCRIPTORS.map((desc) => ({
      ...desc,
      tabLabel: tSearch(`${desc.key}.tabLabel`),
      title: tSearch(`${desc.key}.title`),
      description: tSearch(`${desc.key}.description`),
      keywords: tSearch(`${desc.key}.keywords`),
    }));
  }, [tSearch]);

  const matchedItems = useMemo(() => {
    const q = normalizeSearchText(searchQuery);
    if (!q) return searchItems.slice(0, 6);
    return searchItems.filter((item) => {
      const haystack = normalizeSearchText(
        `${item.title} ${item.description} ${item.tabLabel} ${item.keywords}`
      );
      return haystack.includes(q);
    });
  }, [searchQuery, searchItems]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChooseItem = (item: SettingsSearchItem) => {
    onSelectTab?.(item.tabId);
    setIsDropdownOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsDropdownOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        matchedItems.length > 0 ? (prev + 1) % matchedItems.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        matchedItems.length > 0
          ? (prev - 1 + matchedItems.length) % matchedItems.length
          : 0
      );
    } else if (e.key === 'Enter' && matchedItems[highlightedIndex]) {
      e.preventDefault();
      handleChooseItem(matchedItems[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-none">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[11px] font-bold uppercase tracking-wider border-none">
            {t('badgeHeaderTag')}
          </span>
          <span className="text-[#747775] dark:text-[#8E918F]">•</span>
          <span className="text-xs text-[#747775] dark:text-[#C4C7C5] font-semibold">
            {userFullName || t('defaultUserName')}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
          {t('mainPageTitle')}
        </h1>
        <p className="text-xs text-[#747775] dark:text-[#C4C7C5] max-w-2xl leading-relaxed">
          {t('mainPageSubtitle')}
        </p>
      </div>

      {/* Quick Search Bar inside Page */}
      <div ref={containerRef} className="relative w-full md:w-96 flex flex-col gap-1 shrink-0">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775] dark:text-[#8E918F] text-[20px]">
            manage_search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsDropdownOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t('searchPlaceholder')}
            className="w-full h-11 pl-11 pr-20 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] outline-none transition-all shadow-none"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
                aria-label={t('clearSearchAria')}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#747775] dark:text-[#C4C7C5] cursor-pointer border-none bg-transparent flex items-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            ) : (
              <kbd className="pointer-events-none px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#1E1F20] text-[10px] font-mono text-[#444746] dark:text-[#C4C7C5] font-semibold border-none">
                Ctrl+K
              </kbd>
            )}
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute top-12 left-0 right-0 z-40 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden max-h-80 overflow-y-auto p-1.5">
            {matchedItems.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#747775] dark:text-[#8E918F]">
                {t('searchNoResults', { query: searchQuery })}
              </div>
            ) : (
              matchedItems.map((item, idx) => {
                const isActive = idx === highlightedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleChooseItem(item)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer border-none ${isActive
                        ? 'bg-[#D3E3FD]/50 dark:bg-[#282A2C]'
                        : 'bg-transparent hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]/60'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA] mt-0.5 shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#131314] text-[#444746] dark:text-[#C4C7C5] shrink-0">
                          {item.tabLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#747775] dark:text-[#8E918F] truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        <span className="text-[11px] text-[#747775] dark:text-[#8E918F] px-1">
          {t('searchHintCount')}
        </span>
      </div>
    </div>
  );
}
