'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUserRole } from '@/hooks/useUserRole';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { LatexFormulaPicker } from '@/components/shared/LatexFormulaPicker';
import { useSocraticChat } from '../../hooks/useSocraticChat';
import { SocraticMarkdownRenderer } from '../SocraticMarkdownRenderer';

interface SocraticAICoachProps {
  userFullName?: string;
  width: number;
  onWidthChange: (newWidth: number) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  floatingDock?: boolean;
  isAuthenticated?: boolean;
}

export function SocraticAICoach({
  userFullName = 'Nhật Minh',
  width,
  onWidthChange,
  isMinimized,
  onToggleMinimize,
  floatingDock = false,
  isAuthenticated: propIsAuthenticated,
}: SocraticAICoachProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname() || '/';
  const { isAuthenticated: roleIsAuthenticated } = useUserRole();
  const isAuth = propIsAuthenticated !== undefined ? propIsAuthenticated : roleIsAuthenticated;

  const {
    messages,
    inputText,
    setInputText,
    isTyping,
    sendMessage,
    rateMessage,
    clearHistory,
    streamEndRef,
  } = useSocraticChat({
    userName: userFullName,
    isAuthenticated: isAuth,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFormulaPickerOpen, setIsFormulaPickerOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice Input (Web Speech API)
  const {
    isListening,
    isSupported: isVoiceSupported,
    errorMessage: voiceErrorMessage,
    toggleListening,
    stopListening,
    clearError: clearVoiceError,
  } = useVoiceInput({
    currentText: inputText,
    onTranscript: setInputText,
    lang: 'vi-VN',
  });

  // Resize drag handle logic (Resizes from left edge on desktop: min 450px, max 800px)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const startX = e.clientX;
      const startWidth = Math.min(800, Math.max(450, width));

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = startX - moveEvent.clientX;
        const maxAllowedWidth = Math.max(450, Math.min(800, window.innerWidth - 32));
        const minAllowedWidth = 450;
        const nextWidth = Math.min(
          maxAllowedWidth,
          Math.max(minAllowedWidth, startWidth + deltaX)
        );
        onWidthChange(nextWidth);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width, onWidthChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Insert LaTeX formula at cursor position
  const handleSelectFormula = (formulaLatex: string) => {
    const snippet = `$${formulaLatex}$`;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart ?? inputText.length;
      const end = textarea.selectionEnd ?? inputText.length;

      const before = inputText.substring(0, start);
      const after = inputText.substring(end);

      const padLeft = before.length > 0 && !before.endsWith(' ') ? ' ' : '';
      const padRight = after.length > 0 && !after.startsWith(' ') ? ' ' : ' ';
      const insertText = `${padLeft}${snippet}${padRight}`;

      const updated = before + insertText + after;
      setInputText(updated);

      setTimeout(() => {
        textarea.focus();
        const cursorPosition = start + insertText.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    } else {
      const pad = inputText.length > 0 && !inputText.endsWith(' ') ? ' ' : '';
      setInputText(`${inputText}${pad}${snippet} `);
    }

    setIsFormulaPickerOpen(false);
  };

  // Copy message content
  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  // Floating Action Button (FAB) position state when minimized
  const [fabPosition, setFabPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingFab, setIsDraggingFab] = useState(false);
  const fabPositionRef = useRef<{ x: number; y: number } | null>(null);
  const fabElementRef = useRef<HTMLDivElement>(null);
  const fabDragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const hasDraggedFabRef = useRef(false);

  // Restore saved FAB position from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ilms_focus_fab_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          const maxX = Math.max(16, window.innerWidth - 80);
          const maxY = Math.max(16, window.innerHeight - 80);
          const clamped = {
            x: Math.min(Math.max(16, parsed.x), maxX),
            y: Math.min(Math.max(16, parsed.y), maxY),
          };
          setFabPosition(clamped);
          fabPositionRef.current = clamped;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Ensure FAB stays inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setFabPosition((prev) => {
        if (!prev) return null;
        const maxX = Math.max(16, window.innerWidth - 80);
        const maxY = Math.max(16, window.innerHeight - 80);
        const clampedX = Math.min(Math.max(16, prev.x), maxX);
        const clampedY = Math.min(Math.max(16, prev.y), maxY);
        if (clampedX !== prev.x || clampedY !== prev.y) {
          const next = { x: clampedX, y: clampedY };
          fabPositionRef.current = next;
          return next;
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // FAB Drag Handlers
  const handleFabPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = fabElementRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    fabDragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };
    hasDraggedFabRef.current = false;
    setIsDraggingFab(true);

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  const handleFabPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!fabDragStartRef.current) return;

    const deltaX = e.clientX - fabDragStartRef.current.pointerX;
    const deltaY = e.clientY - fabDragStartRef.current.pointerY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      hasDraggedFabRef.current = true;
    }

    const rawX = fabDragStartRef.current.initialX + deltaX;
    const rawY = fabDragStartRef.current.initialY + deltaY;

    const el = fabElementRef.current;
    const currentWidth = el ? el.offsetWidth : 80;
    const currentHeight = el ? el.offsetHeight : 80;

    const minMargin = 16;
    const maxX = Math.max(minMargin, window.innerWidth - currentWidth - minMargin);
    const maxY = Math.max(minMargin, window.innerHeight - currentHeight - minMargin);

    const clamped = {
      x: Math.min(Math.max(minMargin, rawX), maxX),
      y: Math.min(Math.max(minMargin, rawY), maxY),
    };

    setFabPosition(clamped);
    fabPositionRef.current = clamped;
  }, []);

  const handleFabPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!fabDragStartRef.current) return;

      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }

      const moved = hasDraggedFabRef.current;
      fabDragStartRef.current = null;
      setIsDraggingFab(false);

      if (moved && fabPositionRef.current) {
        try {
          localStorage.setItem(
            'ilms_focus_fab_position',
            JSON.stringify(fabPositionRef.current)
          );
        } catch {
          // ignore
        }
      } else if (!moved) {
        onToggleMinimize();
      }
    },
    [onToggleMinimize]
  );

  // If minimized, render only the mascot floating directly with transparent background
  if (isMinimized) {
    return (
      <div
        ref={fabElementRef}
        onPointerDown={handleFabPointerDown}
        onPointerMove={handleFabPointerMove}
        onPointerUp={handleFabPointerUp}
        onPointerCancel={handleFabPointerUp}
        style={
          fabPosition
            ? {
              left: `${fabPosition.x}px`,
              top: `${fabPosition.y}px`,
              right: 'auto',
              bottom: 'auto',
            }
            : undefined
        }
        className={`fixed z-50 flex items-center justify-center group select-none touch-none bg-transparent border-none shadow-none ${!fabPosition ? 'bottom-6 right-6' : ''
          } ${isDraggingFab ? 'cursor-grabbing scale-105' : 'cursor-grab'}`}
        title={t('restoreTooltip')}
      >
        <div className="relative pointer-events-none transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 active:scale-95">
          <img
            src="/socratic_mascot.png"
            alt="Socratic AI Mascot"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_6px_20px_rgba(168,199,250,0.35)] select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
    );
  }

  const clampedDesktopWidth = Math.min(800, Math.max(450, width));

  return (
    <aside
      style={
        isFullscreen
          ? undefined
          : ({ '--coach-desktop-width': `${clampedDesktopWidth}px` } as React.CSSProperties)
      }
      className={`${isDragging ? 'transition-none' : 'transition-[width,height] duration-200 ease-out'} shrink-0 ${
        isFullscreen
          ? 'fixed left-3 right-3 bottom-3 sm:left-auto sm:right-5 sm:bottom-5 z-50 w-auto sm:w-[800px] sm:max-w-[calc(100vw-2.5rem)] h-[calc(100dvh-1.5rem)] sm:h-[calc(100dvh-2.5rem)]'
          : floatingDock
            ? 'fixed left-3 right-3 bottom-3 sm:left-auto sm:right-5 sm:bottom-5 z-50 w-auto sm:w-[var(--coach-desktop-width)] sm:min-w-[450px] sm:max-w-[min(800px,calc(100vw-2.5rem))] h-[calc(100dvh-5.5rem)] max-h-[580px] sm:h-[620px] sm:max-h-[calc(100dvh-3rem)]'
            : 'relative lg:sticky lg:top-20 w-full sm:w-[var(--coach-desktop-width)] sm:min-w-[450px] sm:max-w-[800px] h-[640px] sm:h-[700px]'
      }`}
    >
      {/* Resizer Handle (Left edge on Desktop) */}
      {!isFullscreen && (
        <div
          onMouseDown={handleMouseDown}
          className={`hidden sm:flex absolute -left-2.5 top-0 bottom-0 w-5 cursor-col-resize z-30 items-center justify-center group ${isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            } transition-opacity`}
          title={t('resizeTooltip')}
        >
          <div
            className={`w-1.5 h-14 rounded-full transition-colors ${isDragging
              ? 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
              : 'bg-slate-300 dark:bg-[#333537] group-hover:bg-[#0B57D0] dark:group-hover:bg-[#A8C7FA]'
              }`}
          />
        </div>
      )}

      {/* Main AI Chat Box Container */}
      <div className="w-full h-full bg-white dark:bg-[#1E1F20] rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden border border-slate-200/80 dark:border-[#2C2E30] shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#282A2C]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-transparent flex items-center justify-center shrink-0">
              <img
                src="/socratic_mascot.png"
                alt="Socratic AI Mascot"
                className="w-10 h-10 object-contain drop-shadow-sm select-none"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#0D652D] dark:bg-[#81C995] ring-2 ring-white dark:ring-[#1E1F20]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {t('aiCoachTitle')}
                </span>
              </div>
              <span className="text-[11px] text-[#747775] dark:text-[#C4C7C5] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D652D] dark:bg-[#81C995]" />
                {t('online')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 relative">
            {/* Dock/Minimize to Mascot FAB */}
            <button
              onClick={onToggleMinimize}
              className="w-7 h-7 rounded-full text-[#747775] hover:text-[#1F1F1F] hover:bg-[#F0F4F9] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] dark:hover:bg-[#282A2C] flex items-center justify-center transition-all cursor-pointer"
              title={t('minimizeTooltip')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">dock_to_right</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="w-7 h-7 rounded-full text-[#747775] hover:text-[#1F1F1F] hover:bg-[#F0F4F9] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] dark:hover:bg-[#282A2C] flex items-center justify-center transition-all cursor-pointer"
              title={isFullscreen ? t('exitFullscreenTooltip') : t('fullscreenTooltip')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFullscreen ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>

            {/* Options Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="w-7 h-7 rounded-full text-[#747775] hover:text-[#1F1F1F] hover:bg-[#F0F4F9] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] dark:hover:bg-[#282A2C] flex items-center justify-center transition-all cursor-pointer"
                title={t('sessionOptions')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl py-1.5 z-50 border border-slate-200 dark:border-[#3C4043]">
                  <div className="px-3 py-2">
                    <div className="text-[11px] font-bold text-[#747775] dark:text-[#8E918F] uppercase tracking-wider">
                      {t('coachSettings')}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        psychology_alt
                      </span>
                      <span>{t('changeStyle')}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E8F0FE] text-[#0B57D0] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-semibold whitespace-nowrap">
                      {t('gentleHint')}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#747775] dark:text-[#8E918F]">
                      picture_as_pdf
                    </span>
                    <span>{t('exportPdf')}</span>
                  </button>
                  <div className="my-1 border-t border-[#E9EEF6] dark:border-[#282A2C]" />
                  <button
                    onClick={() => {
                      clearHistory();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-[#C5221F] dark:text-[#F28B82] hover:bg-[#FCE8E6] dark:hover:bg-[#3C1919] transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                    <span>{t('clearChat')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto py-3.5 flex flex-col gap-4 pr-1 scrollbar-thin">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            if (isAi && !msg.content.trim() && !msg.attachment) {
              return null;
            }
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isAi ? 'max-w-[95%]' : 'ml-auto justify-end max-w-[90%]'
                  }`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-full bg-transparent shrink-0 flex items-center justify-center mt-0.5 overflow-hidden">
                    <img
                      src="/socratic_mascot.png"
                      alt="AI"
                      className="w-8 h-8 object-contain select-none"
                    />
                  </div>
                )}

                <div className={`flex flex-col gap-1.5 ${isAi ? 'flex-1 min-w-0' : 'items-end'}`}>
                  {/* Message Bubble: Completely full, balanced, no notched corners */}
                  <div
                    className={`rounded-2xl text-xs leading-relaxed transition-all ${isAi
                      ? 'p-4 sm:p-4.5 bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] border border-slate-200/50 dark:border-[#383A3C]/70 shadow-xs'
                      : 'px-4 py-2.5 sm:px-4.5 sm:py-3 bg-[#0B57D0] text-white dark:bg-[#0B57D0] dark:text-white shadow-xs font-normal'
                      }`}
                  >
                    {isAi ? (
                      <SocraticMarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {/* Attachment Card if any */}
                  {msg.attachment && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#3C4043] shadow-xs flex items-center justify-between gap-3 w-full">
                      <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] dark:bg-[#162B4D] flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {msg.attachment.icon}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                          {msg.attachment.title}
                        </span>
                        <span className="text-[11px] text-[#747775] dark:text-[#C4C7C5]">
                          {msg.attachment.subtitle}
                        </span>
                      </div>
                      <button
                        className="px-3.5 py-1.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                        type="button"
                      >
                        {msg.attachment.actionText}
                      </button>
                    </div>
                  )}

                  {/* Metadata & Actions row */}
                  {isAi ? (
                    <div className="flex items-center justify-between px-1 text-[10px] text-[#747775] dark:text-[#8E918F] w-full">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-1">
                        {/* Copy message button */}
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-[#333537] text-[#747775] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] transition-colors cursor-pointer"
                          title={copiedMessageId === msg.id ? 'Đã sao chép' : 'Sao chép'}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedMessageId === msg.id ? 'check' : 'content_copy'}
                          </span>
                        </button>

                        {/* Thumbs Up (Like) button */}
                        <button
                          onClick={() => rateMessage(msg.id, 'LIKE')}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${msg.feedback_rating === 'LIKE'
                            ? 'text-[#0B57D0] dark:text-[#A8C7FA] bg-[#E8F0FE] dark:bg-[#162B4D]'
                            : 'hover:bg-slate-200/60 dark:hover:bg-[#333537] text-[#747775] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3]'
                            }`}
                          title="Hữu ích (Like)"
                          type="button"
                        >
                          <span
                            className="material-symbols-outlined text-[14px]"
                            style={msg.feedback_rating === 'LIKE' ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            thumb_up
                          </span>
                        </button>

                        {/* Thumbs Down (Dislike) button */}
                        <button
                          onClick={() => rateMessage(msg.id, 'DISLIKE')}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${msg.feedback_rating === 'DISLIKE'
                            ? 'text-[#B3261E] dark:text-[#F28B82] bg-red-50 dark:bg-red-950/40'
                            : 'hover:bg-slate-200/60 dark:hover:bg-[#333537] text-[#747775] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3]'
                            }`}
                          title="Chưa hài lòng (Dislike)"
                          type="button"
                        >
                          <span
                            className="material-symbols-outlined text-[14px]"
                            style={msg.feedback_rating === 'DISLIKE' ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            thumb_down
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#747775] dark:text-[#8E918F] px-1">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start gap-2.5 max-w-[95%]">
              <div className="w-8 h-8 rounded-full bg-transparent shrink-0 flex items-center justify-center mt-0.5 overflow-hidden">
                <img
                  src="/socratic_mascot.png"
                  alt="AI"
                  className="w-8 h-8 object-contain select-none"
                />
              </div>
              <div className="bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-3 rounded-2xl border border-slate-200/40 dark:border-[#383A3C]/50 flex items-center gap-1.5 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={streamEndRef} />
        </div>

        {/* Chat Input or Auth Gate Area */}
        {!isAuth ? (
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-[#E8F0FE] dark:bg-[#1A2737] border border-[#C2E7FF] dark:border-[#2A4365] flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#0B57D0]/10 text-[#0B57D0] dark:bg-[#A8C7FA]/20 dark:text-[#A8C7FA] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">lock</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                  Đăng nhập để trò chuyện với Trợ lý AI
                </span>
                <span className="text-[11px] text-[#5E5E5E] dark:text-[#C4C7C5] leading-relaxed">
                  Bạn cần có tài khoản ILMS để đặt câu hỏi, phân tích đồ thị tri thức và nhận hỗ trợ giải bài tập từ AI Socratic.
                </span>
              </div>
              <div className="flex items-center gap-2 w-full pt-1">
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>Đăng nhập ngay</span>
                </Link>
                <Link
                  href="/register"
                  className="py-2 px-3 rounded-xl bg-white dark:bg-[#282A2C] hover:bg-slate-50 dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] border border-slate-200 dark:border-transparent text-xs font-semibold flex items-center justify-center transition-colors"
                >
                  <span>Đăng ký</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="pt-2"
          >
            {/* Status banners for Voice recording and Error */}
            {isListening && (
              <div className="mb-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-center justify-between text-xs text-red-600 dark:text-red-300 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="font-medium text-[11px]">Đang lắng nghe giọng nói... Nói để nhập tự động</span>
                </div>
                <button
                  type="button"
                  onClick={stopListening}
                  className="text-[11px] underline font-semibold hover:text-red-700 cursor-pointer"
                >
                  Dừng
                </button>
              </div>
            )}

            {voiceErrorMessage && (
              <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                <span className="text-[11px]">{voiceErrorMessage}</span>
                <button
                  type="button"
                  onClick={clearVoiceError}
                  className="text-[11px] font-semibold hover:text-amber-800 cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-col bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-[#0B57D0]/40 dark:focus-within:ring-[#A8C7FA]/40 transition-all border border-slate-200/60 dark:border-transparent">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent px-1.5 py-1 text-[#1F1F1F] dark:text-[#E3E3E3] text-xs outline-none placeholder:text-[#747775] dark:placeholder:text-[#8E918F] resize-none min-h-[58px] max-h-[140px] overflow-y-auto leading-relaxed border-none focus:outline-none"
                placeholder={t('inputPlaceholder')}
                rows={2}
              />

              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200/40 dark:border-[#383A3C]/40">
                <div className="flex items-center gap-1">
                  {/* Attach file button */}
                  <button
                    className="p-1.5 rounded-full text-[#747775] hover:text-[#1F1F1F] hover:bg-[#E1E5EA] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] dark:hover:bg-[#333537] transition-all cursor-pointer border-none shadow-none"
                    title={t('attachFileTooltip')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">attach_file</span>
                  </button>

                  {/* Insert code snippet button */}
                  <button
                    className="p-1.5 rounded-full text-[#747775] hover:text-[#1F1F1F] hover:bg-[#E1E5EA] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] dark:hover:bg-[#333537] transition-all cursor-pointer border-none shadow-none"
                    title={t('insertCodeTooltip')}
                    type="button"
                    onClick={() => setInputText((prev) => prev + '\n```cpp\n// Code here\n```\n')}
                  >
                    <span className="material-symbols-outlined text-[18px]">code</span>
                  </button>

                  {/* Insert LaTeX Formula button with popup picker */}
                  <div className="relative">
                    <button
                      onClick={() => setIsFormulaPickerOpen((prev) => !prev)}
                      className={`p-1.5 rounded-full transition-all cursor-pointer border-none shadow-none ${isFormulaPickerOpen
                        ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'text-[#747775] hover:text-[#1F1F1F] hover:bg-[#E1E5EA] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] dark:hover:bg-[#333537]'
                        }`}
                      title="Chèn công thức toán LaTeX"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">functions</span>
                    </button>

                    <LatexFormulaPicker
                      isOpen={isFormulaPickerOpen}
                      onClose={() => setIsFormulaPickerOpen(false)}
                      onSelectFormula={handleSelectFormula}
                    />
                  </div>

                  {/* Microphone Voice Input Button */}
                  <button
                    onClick={toggleListening}
                    disabled={!isVoiceSupported}
                    className={`p-1.5 rounded-full transition-all cursor-pointer border-none shadow-none ${!isVoiceSupported
                      ? 'opacity-40 cursor-not-allowed text-[#747775]'
                      : isListening
                        ? 'text-red-600 bg-red-100 dark:bg-red-950/70 dark:text-red-400 ring-2 ring-red-400/60 animate-pulse'
                        : 'text-[#747775] hover:text-[#1F1F1F] hover:bg-[#E1E5EA] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] dark:hover:bg-[#333537]'
                      }`}
                    title={
                      !isVoiceSupported
                        ? 'Trình duyệt không hỗ trợ nhận dạng giọng nói'
                        : isListening
                          ? 'Đang lắng nghe... Bấm để dừng'
                          : t('recordVoiceTooltip')
                    }
                    type="button"
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={isListening ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {!isVoiceSupported ? 'mic_off' : 'mic'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#747775] dark:text-[#8E918F] hidden sm:inline select-none">
                    {t('sendEnter')}
                  </span>
                  <button
                    disabled={!inputText.trim() || isTyping}
                    className="w-8 h-8 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-95 border-none cursor-pointer shadow-xs"
                    title={t('sendButton')}
                    type="submit"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </aside>
  );
}
