'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { OnlinePresenceUser } from '../../store/useChatStore';

interface ActiveUsersStripProps {
  users: OnlinePresenceUser[];
  currentUserId?: string;
  isLoading?: boolean;
  onSelectUser: (userId: string) => void;
}

export function ActiveUsersStrip({
  users,
  currentUserId,
  isLoading = false,
  onSelectUser,
}: ActiveUsersStripProps) {
  const tSidebar = useTranslations('chat.sidebar');
  const peers = users.filter((u) => u.id !== currentUserId);
  if (peers.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <p className="text-[11px] font-semibold text-[#444746] dark:text-[#8E918F] mb-2 px-1">
        {tSidebar('activeOnlineTitle')} ({peers.length})
      </p>
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {peers.map((peer) => {
          const initial = peer.fullName.trim().charAt(0).toUpperCase() || '?';
          const shortName = peer.fullName.trim().split(/\s+/).slice(-1)[0] || peer.fullName;
          return (
            <button
              key={peer.id}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectUser(peer.id)}
              title={tSidebar('startChatWith', { name: peer.fullName })}
              className="flex flex-col items-center gap-1 shrink-0 w-12 group cursor-pointer disabled:opacity-60"
            >
              <div className="relative">
                {peer.avatarUrl ? (
                  <img
                    src={peer.avatarUrl}
                    alt={peer.fullName}
                    className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center text-sm font-bold group-hover:scale-105 transition-transform">
                    {initial}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E1F20]" />
              </div>
              <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] truncate w-full text-center">
                {shortName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
