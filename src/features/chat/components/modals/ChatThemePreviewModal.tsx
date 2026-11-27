'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import {
  CHAT_THEMES,
  CHAT_THEME_ORDER,
  resolveChatTheme,
  type ChatThemeKey,
} from '../../constants/chat-themes';

interface ChatThemePreviewModalProps {
  isOpen: boolean;
  initialThemeKey: ChatThemeKey;
  activeThemeKey: ChatThemeKey;
  isApplying: boolean;
  onClose: () => void;
  onConfirm: (themeKey: ChatThemeKey) => void;
}

export function ChatThemePreviewModal({
  isOpen,
  initialThemeKey,
  activeThemeKey,
  isApplying,
  onClose,
  onConfirm,
}: ChatThemePreviewModalProps) {
  const tThemes = useTranslations('chat.themes');
  const [selectedKey, setSelectedKey] = useState<ChatThemeKey>(initialThemeKey);

  useEffect(() => {
    if (isOpen) {
      setSelectedKey(initialThemeKey);
    }
  }, [isOpen, initialThemeKey]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isApplying) {
        onClose();
        return;
      }
      if (
        e.key === 'ArrowDown' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowLeft'
      ) {
        e.preventDefault();
        const idx = CHAT_THEME_ORDER.indexOf(selectedKey);
        const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
        const nextIdx =
          (idx + delta + CHAT_THEME_ORDER.length) % CHAT_THEME_ORDER.length;
        setSelectedKey(CHAT_THEME_ORDER[nextIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isApplying, selectedKey, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const theme = resolveChatTheme(selectedKey);
  const themeLabel = tThemes(`items.${theme.key}.label`);
  const isCurrentActive = selectedKey === activeThemeKey;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tThemes('modalTitle')}
      onClick={() => {
        if (!isApplying) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[740px] max-h-[88dvh] rounded-3xl bg-white dark:bg-[#1E1F20] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="relative px-5 h-14 flex items-center justify-center border-b border-[#E1E5EA] dark:border-[#282A2C] shrink-0">
          <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3] truncate px-10">
            {tThemes('modalTitle')}
          </h3>
          <button
            type="button"
            disabled={isApplying}
            onClick={onClose}
            aria-label={tThemes('closePreviewAria')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </header>

        {/* Two-column Body: Theme List + Live Chat Preview */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 p-4 sm:p-5 overflow-hidden">
          {/* Left Column: Theme Selector List */}
          <div className="w-full md:w-[270px] shrink-0 overflow-y-auto space-y-1.5 pr-1 max-h-48 md:max-h-none">
            {CHAT_THEME_ORDER.map((key) => {
              const item = CHAT_THEMES[key];
              const itemLabel = tThemes(`items.${key}.label`);
              const itemCredit = tThemes(`items.${key}.artistCredit`);
              const isSelected = key === selectedKey;
              const isApplied = key === activeThemeKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  aria-label={tThemes('switchToThemeAria', { name: itemLabel })}
                  className={`w-full px-3 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#D3E3FD]/55 dark:bg-[#162B4D]'
                      : 'hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.wallpaperUrl ? (
                      <img
                        src={item.wallpaperUrl}
                        alt={itemLabel}
                        className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0B57D0] to-[#6366F1] dark:from-[#4C8DF6] dark:to-[#818CF8] flex items-center justify-center shrink-0 shadow-xs">
                        <span className="w-3.5 h-3.5 rounded-full bg-white dark:bg-[#1E1F20]" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                        {itemLabel}
                      </p>
                      <p className="text-[11px] text-[#747775] dark:text-[#8E918F] truncate">
                        {itemCredit}
                      </p>
                    </div>
                  </div>
                  {isApplied && (
                    <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Wallpaper & Bubble Preview */}
          <div
            className={`relative flex-1 min-h-[280px] md:min-h-[400px] rounded-2xl overflow-hidden flex flex-col border border-[#E1E5EA]/70 dark:border-[#282A2C] ${theme.surfaceBgClass}`}
          >
            {theme.wallpaperUrl && (
              <div className="pointer-events-none absolute inset-0 z-0">
                <img
                  src={theme.wallpaperUrl}
                  alt={themeLabel}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${theme.wallpaperOverlayClass}`} />
              </div>
            )}

            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 flex flex-col justify-end gap-2.5 text-[13px] leading-relaxed">
              {/* Grouped Right Messages (Mine) */}
              <div className="flex flex-col items-end gap-1">
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-tr-2xl rounded-br-[6px] rounded-l-2xl ${theme.myBubbleClass}`}
                >
                  {tThemes('sampleMine1')}
                </div>
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-tr-[6px] rounded-br-2xl rounded-l-2xl ${theme.myBubbleClass}`}
                >
                  {tThemes('sampleMine2')}
                </div>
              </div>

              {/* Left Message (Peer) */}
              <div className="flex justify-start mt-1">
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl ${theme.peerBubbleClass}`}
                >
                  {tThemes('samplePeer')}
                </div>
              </div>

              {/* Timestamp Pill */}
              <div className="flex justify-center my-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${theme.dateDividerClass}`}
                >
                  22:06
                </span>
              </div>

              {/* Final Right Message with Seen Check */}
              <div className="flex items-end justify-end gap-1.5">
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl ${theme.myBubbleClass}`}
                >
                  {tThemes('sampleMine3')}
                </div>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mb-0.5 ${theme.previewConfirmBtnClass}`}
                >
                  <span className="material-symbols-outlined text-[11px] font-bold">
                    check
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="px-5 py-4 border-t border-[#E1E5EA] dark:border-[#282A2C] grid grid-cols-2 gap-3 shrink-0">
          <button
            type="button"
            disabled={isApplying}
            onClick={onClose}
            className="h-10 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer transition-colors disabled:opacity-60"
          >
            {tThemes('cancel')}
          </button>
          <button
            type="button"
            disabled={isApplying}
            onClick={() => {
              if (isCurrentActive) {
                onClose();
                return;
              }
              onConfirm(selectedKey);
            }}
            className="h-10 rounded-2xl bg-[#0B57D0] dark:bg-[#A8C7FA] hover:opacity-90 text-sm font-semibold text-white dark:text-[#062E6F] cursor-pointer transition-opacity disabled:opacity-60"
          >
            {isApplying
              ? tThemes('applying')
              : isCurrentActive
                ? tThemes('using')
                : tThemes('select')}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
