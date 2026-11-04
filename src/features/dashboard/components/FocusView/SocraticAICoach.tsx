'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSocraticChat } from '../../hooks/useSocraticChat';
import { SocraticMarkdownRenderer } from '../SocraticMarkdownRenderer';

interface SocraticAICoachProps {
  userFullName?: string;
  width: number;
  onWidthChange: (newWidth: number) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  floatingDock?: boolean;
}

export function SocraticAICoach({
  userFullName = 'Nhật Minh',
  width,
  onWidthChange,
  isMinimized,
  onToggleMinimize,
  floatingDock = false,
}: SocraticAICoachProps) {
  const t = useTranslations('dashboard');
  const {
    messages,
    inputText,
    setInputText,
    isTyping,
    sendMessage,
    clearHistory,
    streamEndRef,
  } = useSocraticChat(userFullName);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resize drag handle logic (Resizes from left edge, max width = 40% / 2/5 of screen)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const startX = e.clientX;
      const startWidth = width;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = startX - moveEvent.clientX;
        const maxAllowedWidth = Math.floor(window.innerWidth * 0.4); // 2/5 screen width max
        const minAllowedWidth = 320;
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

  const quickChips = [
    t('quickPrompt1'),
    t('quickPrompt2'),
    t('quickPrompt3'),
  ];

  const handleQuickChipClick = (chipText: string) => {
    const clean = chipText.replace(/^[^\w\s\u00C0-\u1EF9]+/, '').trim();
    setInputText(clean);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
    if (e.button !== 0) return; // Only primary mouse button or touch
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
    const width = el ? el.offsetWidth : 80;
    const height = el ? el.offsetHeight : 80;

    const minMargin = 16;
    const maxX = Math.max(minMargin, window.innerWidth - width - minMargin);
    const maxY = Math.max(minMargin, window.innerHeight - height - minMargin);

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
        // Click without dragging -> restore AI Coach view
        onToggleMinimize();
      }
    },
    [onToggleMinimize]
  );

  // If minimized, render only the floating action button (FAB)
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
        className={`fixed z-50 flex items-center gap-2 group select-none touch-none animate-in fade-in ${
          !fabPosition ? 'bottom-6 right-6' : ''
        } ${isDraggingFab ? 'cursor-grabbing scale-105' : 'cursor-grab'}`}
        title={t('restoreTooltip')}
      >
        <div className="pointer-events-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-2 transition-shadow group-hover:shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t('aiCoachTitle')}</span>
          <span className="material-symbols-outlined text-slate-400 text-sm">drag_indicator</span>
        </div>
        <div className="pointer-events-none w-14 h-14 rounded-full bg-primary dark:bg-secondary text-white flex items-center justify-center shadow-xl ring-4 ring-secondary/30 transition-transform group-hover:scale-105">
          <span className="material-symbols-outlined text-[26px]">smart_toy</span>
        </div>
      </div>
    );
  }

  return (
    <aside
      style={{ width: isFullscreen ? 'auto' : `${width}px` }}
      className={`transition-[width] duration-75 shrink-0 ${
        isFullscreen
          ? 'fixed inset-4 z-50'
          : floatingDock
          ? 'fixed bottom-6 right-6 z-50 shadow-2xl'
          : 'relative lg:sticky lg:top-20'
      }`}
    >
      {/* Resizer Handle (Left edge) */}
      {!isFullscreen && (
        <div
          onMouseDown={handleMouseDown}
          className={`absolute -left-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group ${isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            } transition-opacity`}
          title={t('resizeTooltip')}
        >
          <div
            className={`w-1 h-12 rounded-full transition-colors ${isDragging
              ? 'bg-secondary'
              : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-secondary'
              }`}
          />
        </div>
      )}

      {/* Main AI Chat Box Container */}
      <div className={`w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col ${
        floatingDock ? 'h-[620px] max-h-[calc(100vh-4rem)]' : 'h-[700px]'
      } justify-between relative overflow-hidden`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-primary dark:bg-secondary flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('aiCoachTitle')}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-bold">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t('online')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 relative">
            {/* Dock/Minimize to FAB */}
            <button
              onClick={onToggleMinimize}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
              title={t('minimizeTooltip')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">dock_to_right</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
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
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
                title={t('sessionOptions')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('coachSettings')}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        psychology_alt
                      </span>
                      <span>{t('changeStyle')}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-semibold">
                      {t('gentleHint')}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      picture_as_pdf
                    </span>
                    <span>{t('exportPdf')}</span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => {
                      clearHistory();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
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
        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 pr-1 scrollbar-thin">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${isAi ? 'max-w-[95%]' : 'ml-auto justify-end max-w-[90%]'
                  }`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-full bg-primary dark:bg-secondary text-white shrink-0 flex items-center justify-center mt-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  </div>
                )}

                <div className={`flex flex-col gap-1 ${isAi ? '' : 'items-end'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${isAi
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                      : 'bg-secondary text-white rounded-tr-sm'
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
                    <div className="ml-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 flex items-center gap-3 w-full">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-secondary shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">
                          {msg.attachment.icon}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-bold truncate">
                          {msg.attachment.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {msg.attachment.subtitle}
                        </span>
                      </div>
                      <button
                        className="px-2.5 py-1 rounded-lg bg-secondary text-white text-[11px] font-semibold hover:bg-secondary/90 transition-colors"
                        type="button"
                      >
                        {msg.attachment.actionText}
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start gap-2 max-w-[95%]">
              <div className="w-7 h-7 rounded-full bg-primary dark:bg-secondary text-white shrink-0 flex items-center justify-center mt-1">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={streamEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="py-2 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            {t('quickPrompts')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickChipClick(chip)}
                className="text-left text-[11px] font-medium px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="pt-1"
        >
          <div className="flex flex-col bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-2.5 shadow-sm border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-secondary/30 transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent px-1.5 py-1 text-slate-900 dark:text-slate-100 text-xs outline-none placeholder:text-slate-400 resize-none min-h-[60px] max-h-[140px] overflow-y-auto leading-relaxed"
              placeholder={t('inputPlaceholder')}
              rows={2}
            />

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 mt-1">
              <div className="flex items-center gap-0.5">
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all"
                  title={t('attachFileTooltip')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">attach_file</span>
                </button>
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all"
                  title={t('insertCodeTooltip')}
                  type="button"
                  onClick={() => setInputText((prev) => prev + '\n```cpp\n// Code here\n```\n')}
                >
                  <span className="material-symbols-outlined text-[18px]">code</span>
                </button>
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all"
                  title={t('recordVoiceTooltip')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 hidden sm:inline select-none">
                  {t('sendEnter')}
                </span>
                <button
                  disabled={!inputText.trim() || isTyping}
                  className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                  title={t('sendButton')}
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </aside>
  );
}
