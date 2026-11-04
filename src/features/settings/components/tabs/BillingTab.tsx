'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useBillingInfo } from '../../hooks/useSettings';

interface BillingTabProps {
  onSuccessToast: () => void;
}

export function BillingTab({ onSuccessToast }: BillingTabProps) {
  const t = useTranslations('settings');
  const { data: billing, isLoading } = useBillingInfo();

  if (isLoading || !billing) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  const { currentPlan, paymentMethods, invoices } = billing;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('billingHeaderTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('billingHeaderSubtitle')}
          </p>
        </div>

        {/* Plan Feature Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white flex flex-col gap-4 shadow-lg border border-white/10 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center flex-wrap gap-2.5">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {currentPlan.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/30 text-white border border-secondary text-[11px] font-bold tracking-wider">
                  {currentPlan.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                {currentPlan.description}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                onClick={onSuccessToast}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                {t('btnCancelAutoRenew')}
              </button>
              <button
                onClick={onSuccessToast}
                className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all shadow-md flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                {t('btnUpgradeEnterprise')}
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/10 my-1" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t('lblPlanCost')}
                </span>
                <span className="text-base font-bold text-white">
                  {currentPlan.price.toLocaleString('vi-VN')} {currentPlan.currency}{' '}
                  <span className="text-xs text-slate-300 font-normal">
                    {currentPlan.billingCycle} ({t('paidStatus')})
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">event_repeat</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t('lblNextRenewal')}
                </span>
                <span className="text-base font-bold text-white">
                  {currentPlan.expiresAt}{' '}
                  <span className="text-xs text-secondary font-semibold">
                    ({t('autoRenewHint')})
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('paymentMethodsTitle')}
            </h3>
            <button
              onClick={onSuccessToast}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {t('btnAddCard')}
            </button>
          </div>

          {/* Cards List */}
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-secondary text-sm shadow-xs">
                  {pm.brand.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {pm.brand.toUpperCase()} •••• {pm.last4}
                    </span>
                    {pm.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">
                        {t('badgeDefault')}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('expiresPrefix')} {pm.expiry} • {pm.holderName}
                  </span>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                type="button"
                onClick={onSuccessToast}
              >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('invoicesTitle')}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('invoicesSubtitle')}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">{t('thInvoiceId')}</th>
                  <th className="py-3 px-4">{t('thDate')}</th>
                  <th className="py-3 px-4">{t('thService')}</th>
                  <th className="py-3 px-4">{t('thAmount')}</th>
                  <th className="py-3 px-4">{t('thStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('thAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {inv.id}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {inv.date}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                      {inv.service}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {inv.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        {t('badgeSuccess')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={onSuccessToast}
                        className="text-secondary hover:underline font-semibold flex items-center gap-1 justify-end ml-auto"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          receipt_long
                        </span>
                        {t('btnDownloadVat')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
