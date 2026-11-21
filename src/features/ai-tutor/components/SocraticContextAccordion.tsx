'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface SocraticContextAccordionProps {
  chunkIds?: string[];
  nodeIds?: string[];
  canonicalCodes?: string[];
}

export function SocraticContextAccordion({
  chunkIds = [],
  nodeIds = [],
  canonicalCodes = [],
}: SocraticContextAccordionProps) {
  const t = useTranslations('aiTutor');
  const [isOpen, setIsOpen] = useState(false);

  const totalCount = chunkIds.length + nodeIds.length + canonicalCodes.length;
  if (totalCount === 0) return null;

  return (
    <div className="my-2 border border-slate-200/90 dark:border-transparent rounded-xl overflow-hidden bg-slate-50/60 dark:bg-[#1E1F20] text-xs">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-slate-700 dark:text-[#C4C7C5] hover:bg-slate-100/70 dark:hover:bg-[#282A2C] transition-colors"
        type="button"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-[#A8C7FA]">
            account_tree
          </span>
          <span className="font-medium">{t('referencedKnowledgeTitle')}</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-[#162B4D] text-blue-700 dark:text-[#A8C7FA] font-mono text-[11px]">
            {totalCount}
          </span>
        </div>
        <span
          className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="px-3.5 py-3 border-t border-slate-200/80 dark:border-transparent space-y-2.5 bg-white dark:bg-[#1E1F20]">
          {/* Matched Canonical Codes */}
          {canonicalCodes.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t('matchedCanonicalCodes')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {canonicalCodes.map((code) => (
                  <span
                    key={code}
                    className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Neo4j Knowledge Node IDs */}
          {nodeIds.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t('knowledgeNodes')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {nodeIds.map((node) => (
                  <span
                    key={node}
                    className="px-2 py-0.5 rounded bg-blue-50 dark:bg-[#162B4D] border border-blue-200 dark:border-transparent text-blue-700 dark:text-[#A8C7FA] font-mono text-[11px]"
                  >
                    #{node}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Document Chunks */}
          {chunkIds.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t('documentChunks')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chunkIds.map((chunk) => (
                  <span
                    key={chunk}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E1F20] text-slate-600 dark:text-[#C4C7C5] font-mono text-[11px]"
                    title={chunk}
                  >
                    📄 chunk-{chunk.slice(0, 8)}...
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
