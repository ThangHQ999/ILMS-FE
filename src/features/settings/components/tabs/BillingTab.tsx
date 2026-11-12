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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent" />
      </div>
    );
  }

  const { currentPlan, paymentMethods, invoices } = billing;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('billingHeaderTitle')}
          </h2>
          <p className="text-xs text-[#747775] dark:text-[#C4C7C5]">
            {t('billingHeaderSubtitle')}
          </p>
        </div>

        {/* Plan Feature Hero Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E1F20] to-[#162B4D] text-white flex flex-col gap-4 border-none shadow-none relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center flex-wrap gap-2.5">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {currentPlan.name}
                </h3>
                <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] border-none text-xs font-semibold tracking-wider">
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
                className="px-5 py-2.5 rounded-full bg-transparent hover:bg-white/10 text-white border border-white/40 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                {t('btnCancelAutoRenew')}
              </button>
              <button
                onClick={onSuccessToast}
                className="px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] text-xs font-medium transition-all border-none shadow-none flex items-center gap-1.5 cursor-pointer"
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
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
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
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">event_repeat</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t('lblNextRenewal')}
                </span>
                <span className="text-base font-bold text-white">
                  {currentPlan.expiresAt}{' '}
                  <span className="text-xs text-[#A8C7FA] font-semibold">
                    ({t('autoRenewHint')})
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="pt-4 border-t border-[#F0F4F9] dark:border-[#282A2C] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('paymentMethodsTitle')}
            </h3>
            <button
              onClick={onSuccessToast}
              className="px-5 py-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium transition-colors flex items-center gap-1 border-none shadow-none cursor-pointer"
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
              className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded-xl bg-white dark:bg-[#1E1F20] border-none flex items-center justify-center font-bold text-[#0B57D0] dark:text-[#A8C7FA] text-sm shadow-none">
                  {pm.brand.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {pm.brand.toUpperCase()} •••• {pm.last4}
                    </span>
                    {pm.isDefault && (
                      <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[10px] font-bold border-none">
                        {t('badgeDefault')}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#747775] dark:text-[#C4C7C5]">
                    {t('expiresPrefix')} {pm.expiry} • {pm.holderName}
                  </span>
                </div>
              </div>
              <button
                className="text-[#747775] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] p-1.5 rounded-full hover:bg-white dark:hover:bg-[#1E1F20] transition-colors border-none cursor-pointer"
                type="button"
                onClick={onSuccessToast}
              >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="pt-4 border-t border-[#F0F4F9] dark:border-[#282A2C] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('invoicesTitle')}
            </h3>
            <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
              {t('invoicesSubtitle')}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border-none">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F4F9] dark:bg-[#282A2C]/60 text-[#747775] dark:text-[#8E918F] font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-2xl">{t('thInvoiceId')}</th>
                  <th className="py-3 px-4">{t('thDate')}</th>
                  <th className="py-3 px-4">{t('thService')}</th>
                  <th className="py-3 px-4">{t('thAmount')}</th>
                  <th className="py-3 px-4">{t('thStatus')}</th>
                  <th className="py-3 px-4 text-right rounded-r-2xl">{t('thAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F9] dark:divide-[#282A2C]/50 bg-white dark:bg-[#1E1F20]">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {inv.id}
                    </td>
                    <td className="py-3 px-4 text-[#444746] dark:text-[#C4C7C5]">
                      {inv.date}
                    </td>
                    <td className="py-3 px-4 text-[#1F1F1F] dark:text-[#E3E3E3] font-medium">
                      {inv.service}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {inv.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[10px] font-bold border-none">
                        {t('badgeSuccess')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={onSuccessToast}
                        className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-medium flex items-center gap-1 justify-end ml-auto border-none cursor-pointer bg-transparent"
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
