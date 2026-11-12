'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SocraticSessionSidebarItem, ChatSession } from '../types';

interface AiTutorSidebarProps {
  sessions: (SocraticSessionSidebarItem | ChatSession)[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userFullName?: string;
  isLoading?: boolean;
}

export function AiTutorSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  isCollapsed,
  onToggleCollapse,
  userFullName = 'Trần Nhật Minh',
  isLoading = false,
}: AiTutorSidebarProps) {
  const t = useTranslations('aiTutor');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const getSessionDate = (s: SocraticSessionSidebarItem | ChatSession): string | undefined => {
    if ('updated_at' in s && typeof s.updated_at === 'string') return s.updated_at;
    if ('updatedAt' in s && typeof s.updatedAt === 'string') return s.updatedAt;
    return undefined;
  };

  const todaySessions = sessions.filter((s) => {
    if ('group' in s && s.group === 'today') return true;
    return isToday(getSessionDate(s));
  });

  const pastSessions = sessions.filter((s) => {
    if ('group' in s && s.group === 'past7days') return true;
    return !isToday(getSessionDate(s));
  });

  const initials =
    userFullName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'NM';

  const startRename = (session: SocraticSessionSidebarItem | ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const handleFinishRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  if (isCollapsed) {
    return (
      <aside className="hidden lg:flex w-[60px] shrink-0 bg-[#F0F4F9] dark:bg-[#1E1F20] border-none flex-col items-center justify-between py-3 h-full select-none z-30 transition-all duration-300">
        <div className="flex flex-col items-center gap-3 w-full">
          <Link href="/dashboard" className="p-1 hover:opacity-80 transition-opacity" title="Về Dashboard">
            <img src="/logo-short.png" alt="ILMS" className="h-6 w-auto hidden dark:block" />
            <img src="/logo-short.png" alt="ILMS" className="h-6 w-auto block dark:hidden" />
          </Link>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] transition-colors"
            title={t('expandSidebar')}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">dock_to_right</span>
          </button>
          <button
            onClick={onNewChat}
            className="w-10 h-10 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap flex items-center justify-center border-none shadow-none transition-all"
            title={t('newChat')}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-[#282A2C] text-white font-semibold text-[11px] flex items-center justify-center shadow-none">
          {initials}
        </div>
      </aside>
    );
  }

  const renderSessionItem = (session: SocraticSessionSidebarItem | ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => onSelectSession(session.id)}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-full cursor-pointer transition-all ${
          isActive
            ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-medium'
            : 'text-slate-700 dark:text-[#C4C7C5] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1">
          <span
            className={`material-symbols-outlined text-[17px] shrink-0 ${
              isActive ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-slate-400'
            }`}
          >
            {isActive ? 'chat_bubble' : 'chat_bubble_outline'}
          </span>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleFinishRename(session.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishRename(session.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              className="w-full bg-white dark:bg-[#1E1F20] border-none rounded-full px-2 py-0.5 text-xs text-slate-900 dark:text-[#E3E3E3] outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate text-[13px]">{session.title}</span>
          )}
        </div>

        {!isEditing && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId((prev) => (prev === session.id ? null : session.id));
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-300/60 dark:hover:bg-[#282A2C] rounded text-slate-500 dark:text-[#C4C7C5] transition-opacity shrink-0"
              title={t('options')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">more_horiz</span>
            </button>

            {menuOpenId === session.id && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-lg border-none py-1 z-50 animate-in fade-in">
                <button
                  onClick={(e) => startRename(session, e)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center gap-1.5"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>{t('renameChat')}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                    setMenuOpenId(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-[#F28B82] hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  <span>{t('deleteChat')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onToggleCollapse}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 z-50 lg:static lg:z-30 w-[280px] sm:w-[300px] lg:w-[270px] shrink-0 bg-[#F0F4F9] dark:bg-[#1E1F20] border-none flex flex-col justify-between h-full select-none shadow-none transition-all duration-300">
        {/* Top & Scrollable History */}
        <div className="flex flex-col h-[calc(100%-80px)] p-3">
        {/* Header Sidebar: Logo & Collapse Button */}
        <div className="flex items-center justify-between px-2 pt-1 pb-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 focus:outline-none">
            <img src="/logo-short.png" alt="ILMS Logo" className="h-6 w-auto hidden dark:block" />
            <img src="/logo-short.png" alt="ILMS Logo" className="h-6 w-auto block dark:hidden" />
            <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-[#E3E3E3]">
              ILMS <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-normal">Tutor</span>
            </span>
          </Link>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] transition-colors"
            title={t('collapseSidebar')}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
          </button>
        </div>

        {/* Nút Khởi tạo New Chat */}
        <div className="px-1 mb-3">
          <button
            onClick={onNewChat}
            className="w-full py-2.5 px-4 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap text-[13px] font-medium flex items-center justify-between border-none shadow-none transition-all group"
            type="button"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{t('newChat')}</span>
            </div>
            <span className="text-[10px] font-mono opacity-80 bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-full border-none">
              ⌘K
            </span>
          </button>
        </div>

        {/* Cuộn danh sách Lịch sử Chat */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 -mr-1 text-[13px] scrollbar-thin">
          {isLoading && (
            <div className="space-y-2 p-1">
              <div className="h-7 rounded-full bg-slate-200/60 dark:bg-[#282A2C] animate-pulse" />
              <div className="h-7 rounded-full bg-slate-200/60 dark:bg-[#282A2C] animate-pulse" />
              <div className="h-7 rounded-full bg-slate-200/60 dark:bg-[#282A2C] animate-pulse" />
            </div>
          )}

          {/* Nhóm: HÔM NAY */}
          {todaySessions.length > 0 && (
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                {t('historyToday')}
              </div>
              {todaySessions.map(renderSessionItem)}
            </div>
          )}

          {/* Nhóm: CŨ HƠN */}
          {pastSessions.length > 0 && (
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                {t('historyPast7Days')}
              </div>
              {pastSessions.map(renderSessionItem)}
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400 dark:text-[#8E918F]">
              {t('noSessionsYet')}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Profile */}
      <div className="p-2.5 border-none bg-transparent flex flex-col gap-1">
        <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-[#282A2C] text-white font-semibold text-[12px] flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-slate-900 dark:text-[#E3E3E3] truncate">
                  {userFullName}
                </span>
                <span className="text-[10px] bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] border-none font-bold px-2 py-0.5 rounded-full leading-tight">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5] truncate">
                {t('studentRole')}
              </span>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title={t('aiSettingsTooltip')}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </Link>
        </div>
      </div>
    </aside>
    </>
  );
}
