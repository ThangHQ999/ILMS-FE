'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function PricingComparisonTable() {
  const t = useTranslations('pricing.table');

  return (
    <section className="flex flex-col gap-4 pt-6 w-full">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#e3e3e3]">
          {t('title')}
        </h2>
        <p className="text-xs text-slate-600 dark:text-[#c4c7c5] mt-1">
          {t('subtitle')}
        </p>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043]">
        <table className="w-full text-left border-collapse min-w-[720px] text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#3c4043] bg-slate-50 dark:bg-[#282a2c]/50">
              <th className="p-3.5 font-semibold text-slate-600 dark:text-[#c4c7c5] w-2/6">
                {t('columns.feature')}
              </th>
              <th className="p-3.5 font-medium text-slate-600 dark:text-[#c4c7c5] text-center w-1/6">
                {t('columns.free')}
              </th>
              <th className="p-3.5 font-semibold text-blue-700 dark:text-[#a8c7fa] text-center w-1/6 bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                {t('columns.plus')}
              </th>
              <th className="p-3.5 font-medium text-slate-600 dark:text-[#c4c7c5] text-center w-1/6">
                {t('columns.pro')}
              </th>
              <th className="p-3.5 font-medium text-slate-600 dark:text-[#c4c7c5] text-center w-1/6">
                {t('columns.enterprise')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#3c4043] text-slate-600 dark:text-[#c4c7c5]">
            {/* Row 1: Storage */}
            <tr>
              <td className="p-3.5 text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('rows.storage')}
              </td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f]">
                1 GB
              </td>
              <td className="p-3.5 text-center font-semibold text-blue-700 dark:text-[#a8c7fa] bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                15 GB
              </td>
              <td className="p-3.5 text-center">50 GB</td>
              <td className="p-3.5 text-center text-slate-900 dark:text-[#e3e3e3] font-medium">
                200 GB+
              </td>
            </tr>

            {/* Row 2: AI Queries */}
            <tr>
              <td className="p-3.5 text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('rows.aiInteractions')}
              </td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f]">
                20 lượt
              </td>
              <td className="p-3.5 text-center font-semibold text-blue-700 dark:text-[#a8c7fa] bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                300 lượt
              </td>
              <td className="p-3.5 text-center">1.000 lượt</td>
              <td className="p-3.5 text-center text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('unlimited')}
              </td>
            </tr>

            {/* Row 3: Knowledge Graphs */}
            <tr>
              <td className="p-3.5 text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('rows.knowledgeGraphs')}
              </td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f]">
                5 đồ thị
              </td>
              <td className="p-3.5 text-center font-semibold text-blue-700 dark:text-[#a8c7fa] bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                30 đồ thị
              </td>
              <td className="p-3.5 text-center">150 đồ thị</td>
              <td className="p-3.5 text-center text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('unlimited')}
              </td>
            </tr>

            {/* Row 4: AI Quiz Generation */}
            <tr>
              <td className="p-3.5 text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('rows.quizGeneration')}
              </td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f]">—</td>
              <td className="p-3.5 text-center text-blue-600 dark:text-[#a8c7fa] bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </td>
              <td className="p-3.5 text-center text-blue-600 dark:text-[#a8c7fa]">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </td>
              <td className="p-3.5 text-center text-blue-600 dark:text-[#a8c7fa]">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </td>
            </tr>

            {/* Row 5: Course Limits */}
            <tr>
              <td className="p-3.5 text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('rows.courseLimit')}
              </td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f]">
                3 khóa học
              </td>
              <td className="p-3.5 text-center font-semibold text-blue-700 dark:text-[#a8c7fa] bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                15 khóa học
              </td>
              <td className="p-3.5 text-center">50 khóa học</td>
              <td className="p-3.5 text-center text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('unlimited')}
              </td>
            </tr>

            {/* Row 6: Essay Grading */}
            <tr>
              <td className="p-3.5 text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('rows.essayGrading')}
              </td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f]">—</td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f] bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                —
              </td>
              <td className="p-3.5 text-center text-blue-600 dark:text-[#a8c7fa]">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </td>
              <td className="p-3.5 text-center text-blue-600 dark:text-[#a8c7fa]">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </td>
            </tr>

            {/* Row 7: Custom Domain */}
            <tr>
              <td className="p-3.5 text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('rows.customDomain')}
              </td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f]">—</td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f] bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                —
              </td>
              <td className="p-3.5 text-center text-slate-400 dark:text-[#8e918f]">—</td>
              <td className="p-3.5 text-center text-blue-600 dark:text-[#a8c7fa]">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </td>
            </tr>

            {/* Row 8: Support */}
            <tr>
              <td className="p-3.5 text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('rows.supportLevel')}
              </td>
              <td className="p-3.5 text-center text-slate-500 dark:text-[#8e918f]">
                {t('standardSupport')}
              </td>
              <td className="p-3.5 text-center text-blue-700 dark:text-[#a8c7fa] bg-blue-50/60 dark:bg-[#a8c7fa]/5 border-x border-slate-200 dark:border-[#3c4043]">
                {t('priorityTicket')}
              </td>
              <td className="p-3.5 text-center">
                {t('prioritySla')}
              </td>
              <td className="p-3.5 text-center text-slate-900 dark:text-[#e3e3e3] font-medium">
                {t('dedicatedSla')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
