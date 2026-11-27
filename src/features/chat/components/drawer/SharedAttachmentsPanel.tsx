'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useConversationAttachments } from '../../hooks/useChatMessages';
import { resolveSharedResourceHref } from '../../utils/chat-message.utils';

interface SharedAttachmentsPanelProps {
  conversationId: string;
}

const ATTACHMENT_TABS = [
  { key: 'RESOURCE_SHARE', labelKey: 'tabResources' },
  { key: 'IMAGE', labelKey: 'tabImages' },
  { key: 'FILE', labelKey: 'tabFiles' },
] as const;

export function SharedAttachmentsPanel({
  conversationId,
}: SharedAttachmentsPanelProps) {
  const t = useTranslations('chat.drawer.attachments');
  const tMsg = useTranslations('chat.messages');
  const [tab, setTab] = useState<'RESOURCE_SHARE' | 'IMAGE' | 'FILE'>('RESOURCE_SHARE');
  const { data: items = [], isLoading } = useConversationAttachments(
    conversationId,
    tab,
    true
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]">
        {ATTACHMENT_TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
              tab === item.key
                ? 'bg-white dark:bg-[#1E1F20] text-[#041E49] dark:text-[#A8C7FA] shadow-xs'
                : 'text-[#444746] dark:text-[#C4C7C5]'
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-12 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
          <div className="h-12 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-center text-[#747775] dark:text-[#8E918F] py-4">
          {t('empty')}
        </p>
      ) : tab === 'IMAGE' ? (
        <div className="grid grid-cols-3 gap-1.5">
          {items.map((msg) => {
            const url = msg.attachment?.directUrl || msg.attachment?.fileUrl;
            if (!url) return null;
            return (
              <a
                key={msg.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden bg-[#F0F4F9] dark:bg-[#282A2C]"
              >
                <img src={url} alt={msg.attachment?.fileName || ''} className="w-full h-full object-cover" />
              </a>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {items.map((msg) => {
            if (msg.sharedResource) {
              const href = resolveSharedResourceHref(msg.sharedResource);
              const knownType = msg.sharedResource.resourceType;
              const typeLabel = [
                'MATERIAL',
                'COURSE',
                'LESSON',
                'QUIZ',
                'ASSIGNMENT',
                'EXAM',
                'CONCEPT',
                'FILE',
              ].includes(knownType)
                ? tMsg(`resourceTypes.${knownType}`)
                : knownType;
              return (
                <Link
                  key={msg.id}
                  href={href}
                  className="block p-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-xs"
                >
                  <p className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                    {msg.sharedResource.title}
                  </p>
                  <p className="text-[10px] text-[#747775] dark:text-[#8E918F]">
                    {typeLabel}
                    {msg.sharedResource.subtitle ? ` • ${msg.sharedResource.subtitle}` : ''}
                  </p>
                </Link>
              );
            }
            if (msg.attachment) {
              return (
                <a
                  key={msg.id}
                  href={msg.attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-xs"
                >
                  <p className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                    {msg.attachment.fileName || t('downloadFallback')}
                  </p>
                </a>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
