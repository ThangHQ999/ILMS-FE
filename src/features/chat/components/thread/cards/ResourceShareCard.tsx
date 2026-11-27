'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { SharedResourceMeta, SharedResourceType } from '../../../schemas/chat.schema';
import { resolveSharedResourceHref } from '../../../utils/chat-message.utils';

interface ResourceShareCardProps {
  resource: SharedResourceMeta;
  isMine?: boolean;
}

const RESOURCE_ICON: Record<SharedResourceType, string> = {
  MATERIAL: 'description',
  COURSE: 'menu_book',
  LESSON: 'play_lesson',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  EXAM: 'school',
  CONCEPT: 'hub',
  FILE: 'attach_file',
};

export function ResourceShareCard({ resource, isMine = false }: ResourceShareCardProps) {
  const tMsg = useTranslations('chat.messages');
  const icon = RESOURCE_ICON[resource.resourceType] ?? RESOURCE_ICON.MATERIAL;
  const badge = tMsg(`resourceTypes.${resource.resourceType}` as const);
  const href = resolveSharedResourceHref(resource);
  const isExternal = href.startsWith('http://') || href.startsWith('https://');

  const cardInner = (
    <div
      className={`rounded-2xl p-3.5 flex items-center gap-3 transition-colors max-w-xs sm:max-w-sm ${
        isMine
          ? 'bg-white/15 hover:bg-white/25 text-white'
          : 'bg-white dark:bg-[#1E1F20] hover:bg-[#E1E5EA]/50 dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3]'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isMine
            ? 'bg-white/20 text-white'
            : 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="min-w-0 flex-1 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80 block">
          {badge}
        </span>
        <p className="text-xs sm:text-sm font-semibold truncate">{resource.title}</p>
        {resource.subtitle && (
          <p className="text-[11px] opacity-80 truncate">{resource.subtitle}</p>
        )}
      </div>
      <span className="material-symbols-outlined text-[18px] opacity-80 shrink-0">
        arrow_forward
      </span>
    </div>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {cardInner}
      </a>
    );
  }

  return (
    <Link href={href} className="block">
      {cardInner}
    </Link>
  );
}
