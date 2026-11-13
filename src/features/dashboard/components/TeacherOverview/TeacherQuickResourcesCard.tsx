'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface DocumentResource {
  id: string;
  name: string;
  icon: string;
  size: string;
}

const defaultDocs: DocumentResource[] = [
  {
    id: 'd1',
    name: 'De_Cuong_Mon_Hoc_2024.pdf',
    icon: 'folder',
    size: '1.2 MB',
  },
  {
    id: 'd2',
    name: 'Source_Code_Template_Lab.zip',
    icon: 'terminal',
    size: '14.8 MB',
  },
];

export function TeacherQuickResourcesCard() {
  const t = useTranslations('dashboard.teacher');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => setDownloadingId(null), 1500);
  };

  return (
    <section className="p-6 rounded-3xl bg-surface shadow-md3-1 dark:shadow-none border-none flex flex-col gap-5">
      {/* Header with quota */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[22px]">
            cloud
          </span>
          <h2 className="text-lg font-bold text-foreground">
            {t('resourcesTitle')}
          </h2>
        </div>
        <span className="font-mono text-sm text-muted-foreground font-semibold">
          {t('storageQuota')}
        </span>
      </div>

      {/* Storage progress bar */}
      <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden border-none">
        <div
          className="bg-[#0B57D0] dark:bg-[#A8C7FA] h-2.5 rounded-full transition-all duration-500"
          style={{ width: '14%' }}
        />
      </div>

      {/* Fast Export actions with borders and larger text */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('exportReportTitle')}
        </span>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/80 border border-[#E1E5EA] dark:border-[#282A2C] text-foreground transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px] text-[#B3261E] dark:text-[#F2B8B5]">
              picture_as_pdf
            </span>
            <span>{t('pdfReport')}</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/80 border border-[#E1E5EA] dark:border-[#282A2C] text-foreground transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px] text-[#0B57D0] dark:text-[#A8C7FA]">
              table_view
            </span>
            <span>{t('excelGradebook')}</span>
          </button>
        </div>
      </div>

      {/* Shared Documents list */}
      <div className="flex flex-col gap-1.5 pt-1">
        {defaultDocs.map((doc) => {
          const isDownloading = downloadingId === doc.id;

          return (
            <div
              key={doc.id}
              onClick={() => handleDownload(doc.id)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-variant/50 border border-transparent hover:border-[#E1E5EA] dark:hover:border-[#282A2C] text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-[20px] text-muted-foreground group-hover:text-primary transition-colors">
                  {doc.icon}
                </span>
                <span className="text-sm font-medium truncate text-foreground">
                  {doc.name}
                </span>
              </div>

              <span className="material-symbols-outlined text-[18px] text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                {isDownloading ? 'done' : 'download'}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

