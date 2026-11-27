'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import {
  CHAT_EMOJI_CATEGORIES,
  QUICK_REACTION_EMOJIS,
  searchChatEmojis,
  type ChatEmojiCategoryId,
} from '../../constants/chat-emojis';

interface ChatEmojiPickerModalProps {
  isOpen: boolean;
  activeEmoji: string;
  isApplying: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export function ChatEmojiPickerModal({
  isOpen,
  activeEmoji,
  isApplying,
  onClose,
  onSelect,
}: ChatEmojiPickerModalProps) {
  const t = useTranslations('chat.modals.emojiPicker');
  const tCommon = useTranslations('chat.common');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] =
    useState<ChatEmojiCategoryId>('smileys');

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isApplying) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isApplying, onClose]);

  const searchResults = useMemo(() => searchChatEmojis(search), [search]);

  if (!isOpen || typeof document === 'undefined') return null;

  const currentCategory =
    CHAT_EMOJI_CATEGORIES.find((cat) => cat.id === activeCategory) ??
    CHAT_EMOJI_CATEGORIES[0];
  const isSearching = search.trim().length > 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
      onClick={() => {
        if (!isApplying) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] max-h-[85dvh] rounded-3xl bg-white dark:bg-[#1E1F20] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="relative px-4 h-14 flex items-center justify-center border-b border-[#E1E5EA] dark:border-[#282A2C] shrink-0">
          <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('title')}
          </h3>
          <button
            type="button"
            disabled={isApplying}
            onClick={onClose}
            aria-label={tCommon('close')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </header>

        {/* Search Input */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#747775] dark:text-[#8E918F] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              autoFocus
              className="w-full h-9 pl-10 pr-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] outline-none focus:ring-2 focus:ring-[#0B57D0]/30 dark:focus:ring-[#A8C7FA]/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label={tCommon('close')}
                className="absolute right-2.5 text-[#747775] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Emoji Grid */}
        <div className="flex-1 min-h-[260px] max-h-[340px] overflow-y-auto px-4 pb-3 space-y-3">
          {isSearching ? (
            <>
              <p className="text-xs font-medium text-[#747775] dark:text-[#8E918F]">
                {t('searchResultsLabel', { count: searchResults.length })}
              </p>
              {searchResults.length === 0 ? (
                <p className="text-xs text-center text-[#747775] dark:text-[#8E918F] py-10">
                  {t('noResults')}
                </p>
              ) : (
                <div className="grid grid-cols-8 gap-1">
                  {searchResults.map((entry) => {
                    const selected = entry.emoji === activeEmoji;
                    return (
                      <button
                        key={entry.emoji}
                        type="button"
                        disabled={isApplying}
                        onClick={() => onSelect(entry.emoji)}
                        className={`h-10 rounded-xl text-2xl flex items-center justify-center cursor-pointer transition-colors ${
                          selected
                            ? 'bg-[#D3E3FD] dark:bg-[#162B4D] ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]'
                            : 'hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                        }`}
                      >
                        {entry.emoji}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Quick Picks + Optional Reset */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[#747775] dark:text-[#8E918F]">
                    {t('quickPicksLabel')}
                  </p>
                  {activeEmoji !== '👍' && (
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => onSelect('👍')}
                      className="text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer disabled:opacity-60"
                    >
                      {t('resetDefault')}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {QUICK_REACTION_EMOJIS.map((emoji) => {
                    const selected = emoji === activeEmoji;
                    return (
                      <button
                        key={`quick-${emoji}`}
                        type="button"
                        disabled={isApplying}
                        onClick={() => onSelect(emoji)}
                        className={`h-9 rounded-xl text-xl flex items-center justify-center cursor-pointer transition-colors ${
                          selected
                            ? 'bg-[#D3E3FD] dark:bg-[#162B4D] ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]'
                            : 'hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Category Grid */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[#747775] dark:text-[#8E918F]">
                  {t(`categories.${currentCategory.id}`)}
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {currentCategory.items.map((entry) => {
                    const selected = entry.emoji === activeEmoji;
                    return (
                      <button
                        key={`${currentCategory.id}-${entry.emoji}`}
                        type="button"
                        disabled={isApplying}
                        onClick={() => onSelect(entry.emoji)}
                        className={`h-10 rounded-xl text-2xl flex items-center justify-center cursor-pointer transition-colors ${
                          selected
                            ? 'bg-[#D3E3FD] dark:bg-[#162B4D] ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]'
                            : 'hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                        }`}
                      >
                        {entry.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Category Bar */}
        <footer className="px-2 py-2 border-t border-[#E1E5EA] dark:border-[#282A2C] grid grid-cols-8 gap-1 shrink-0">
          {CHAT_EMOJI_CATEGORIES.map((category) => {
            const active = !isSearching && activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                title={t(`categories.${category.id}`)}
                aria-label={t(`categories.${category.id}`)}
                onClick={() => {
                  setSearch('');
                  setActiveCategory(category.id);
                }}
                className={`h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#D3E3FD]/70 dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA]'
                    : 'text-[#747775] dark:text-[#8E918F] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {category.icon}
                </span>
              </button>
            );
          })}
        </footer>
      </div>
    </div>,
    document.body
  );
}
