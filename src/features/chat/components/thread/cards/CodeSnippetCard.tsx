'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/sonner';

interface CodeSnippetCardProps {
  code: string;
  language?: string | null;
}

export function CodeSnippetCard({ code, language }: CodeSnippetCardProps) {
  const tMsg = useTranslations('chat.messages');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(tMsg('codeCopy'));
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-[#131314] text-[#E3E3E3] max-w-md sm:max-w-lg text-left">
      <div className="px-3.5 py-2 bg-[#282A2C] flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] font-semibold uppercase text-[#A8C7FA]">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C4C7C5] hover:text-white cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? tMsg('codeCopied') : tMsg('codeCopy')}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
