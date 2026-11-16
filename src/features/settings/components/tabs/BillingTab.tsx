'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/features/auth';
import { useStorageSummary } from '../../hooks/useStorage';
import {
  useMySubscription,
  useSubscriptionPlans,
  useCancelAutoRenew,
  useSubscriptionHistory,
} from '../../hooks/useSubscriptions';
import { CloudStorageCard } from '../storage/CloudStorageCard';
import { SubscriptionPlansModal } from '../modals/SubscriptionPlansModal';

interface BillingTabProps {
  onSuccessToast: () => void;
}

export function BillingTab({ onSuccessToast }: BillingTabProps) {
  const t = useTranslations('settings');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: mySub } = useMySubscription();
  const { data: plans = [] } = useSubscriptionPlans();
  const { data: storageSummary } = useStorageSummary();
  const { data: history = [] } = useSubscriptionHistory();

  const cancelAutoRenewMutation = useCancelAutoRenew(() => {
    onSuccessToast();
  });

  // Derive active plan code and details (default: FREE)
  const currentPlanCode = mySub?.planCode || storageSummary?.planCode || 'FREE';
  const isFree = currentPlanCode === 'FREE';

  const activePlan =
    plans.find((p) => p.code === currentPlanCode || p.id === mySub?.planId) ||
    plans.find((p) => p.code === (isFree ? 'FREE' : 'PRO')) ||
    plans[0];

  const currentPlanName =
    mySub?.planName ||
    activePlan?.name ||
    (isFree ? 'Gói Cơ bản (Miễn phí)' : 'Gói Chuyên nghiệp (Pro)');

  const planDescription =
    activePlan?.description ||
    (isFree
      ? 'Dành cho học viên mới bắt đầu khám phá hệ sinh thái học tập và phòng Lab AI ILMS.'
      : 'Truy cập toàn bộ tài nguyên AI Socratic, lưu trữ đám mây dung lượng cao và công cụ quản trị lớp học nâng cao.');

  const planPriceFormatted = activePlan
    ? activePlan.price === 0
      ? '0 đ'
      : `${activePlan.price.toLocaleString('vi-VN')} đ`
    : isFree
    ? '0 đ'
    : '149.000 đ';

  const planCycleFormatted = activePlan?.billingCycle || (isFree ? 'Vĩnh viễn' : 'Tháng');
  const autoRenewActive = mySub?.autoRenew ?? false;
  const daysRemaining = mySub?.daysRemaining;
  const limits = mySub?.limits;

  const maxStorageText =
    storageSummary?.maxStorageFormatted ||
    limits?.maxStorageFormatted ||
    activePlan?.maxStorageFormatted ||
    (isFree ? '1.0 GB' : '50.0 GB');

  const aiDailyLimitText =
    limits?.aiDailyRequests ?? activePlan?.aiDailyRequests ?? (isFree ? 20 : 200);

  // Derive card holder name from logged in user
  const userFullName = currentUser
    ? [currentUser.lastName, currentUser.middleName, currentUser.firstName]
        .filter(Boolean)
        .join(' ') || currentUser.email
    : '';
  const cardHolderName = userFullName ? userFullName.toUpperCase() : 'USER';

  const handleCancelAutoRenew = () => {
    if (confirm('Bạn có chắc chắn muốn hủy tự động gia hạn gói dịch vụ này?')) {
      cancelAutoRenewMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Main Subscription Card */}
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
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E1F20] to-[#162B4D] text-white flex flex-col gap-5 border-none shadow-none relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center flex-wrap gap-2.5">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {currentPlanName}
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase border-none ${
                    isFree
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-[#D3E3FD] text-[#041E49]'
                  }`}
                >
                  {currentPlanCode}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    isFree
                      ? 'bg-slate-700/60 text-slate-300 border border-slate-600'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {isFree
                    ? 'Đang sử dụng'
                    : mySub?.status === 'ACTIVE'
                    ? 'Đang kích hoạt'
                    : 'Hoạt động'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                {planDescription}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              {!isFree && autoRenewActive && (
                <button
                  onClick={handleCancelAutoRenew}
                  disabled={cancelAutoRenewMutation.isPending}
                  className="px-5 py-2.5 rounded-full bg-transparent hover:bg-white/10 text-white border border-white/40 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  <span>
                    {cancelAutoRenewMutation.isPending ? 'Đang xử lý...' : t('btnCancelAutoRenew')}
                  </span>
                </button>
              )}
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-[#E3E3E3] text-xs font-semibold transition-all border border-white/10 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>Xem Bảng giá & So sánh</span>
              </Link>
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] text-xs font-bold transition-all border-none shadow-none flex items-center gap-1.5 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                <span>{isFree ? 'Nâng cấp Gói Dịch vụ' : 'Đổi / Nâng cấp Gói'}</span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/10 my-1" />

          {/* Details & Limits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t('lblPlanCost')}
                </span>
                <span className="text-base font-bold text-white">
                  {planPriceFormatted}{' '}
                  <span className="text-xs text-slate-300 font-normal">/ {planCycleFormatted}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">event_repeat</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Thời hạn còn lại
                </span>
                <span className="text-base font-bold text-white">
                  {isFree || !daysRemaining ? (
                    'Vĩnh viễn'
                  ) : (
                    <>
                      {daysRemaining} ngày{' '}
                      <span className="text-xs text-[#A8C7FA] font-semibold">
                        ({autoRenewActive ? t('autoRenewHint') : 'Tự hủy sau chu kỳ'})
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 p-1">
                <img src="/socratic_mascot.png" alt="Socratic AI" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Hạn mức AI
                </span>
                <span className="text-base font-bold text-white">
                  {aiDailyLimitText} câu{' '}
                  <span className="text-xs text-slate-300 font-normal">/ ngày</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">cloud_queue</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Lưu trữ đám mây
                </span>
                <span className="text-base font-bold text-white">
                  {maxStorageText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cloud Storage Quota & Breakdown Section (PROMINENT RIGHT BELOW HERO CARD) */}
      <CloudStorageCard onSuccessToast={onSuccessToast} />

      {/* 3. Payment Methods & Billing Invoices */}
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-5">
        {/* Payment Methods */}
        <div className="flex flex-col gap-4">
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

          <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#747775] dark:text-[#C4C7C5]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-[#0B57D0] dark:text-[#A8C7FA]">
                account_balance_wallet
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                  Hỗ trợ thanh toán đa kênh
                </span>
                <span>
                  Hỗ trợ VNPAY, MoMo, Chuyển khoản ngân hàng QR Code và thẻ tín dụng Visa / MasterCard.
                </span>
              </div>
            </div>
            <span className="font-mono text-[11px] px-3 py-1 bg-white dark:bg-[#1E1F20] rounded-full self-start sm:self-auto font-medium">
              Chủ thẻ: {cardHolderName}
            </span>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="pt-4 border-t border-[#F0F4F9] dark:border-[#282A2C] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              Lịch sử Giao dịch & Hóa đơn ({history.length})
            </h3>
            <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
              {t('invoicesSubtitle')}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/40 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#D3E3FD]/50 text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3] mt-1">
                Chưa có lịch sử giao dịch phát sinh
              </span>
              <p className="text-[11px] text-[#747775] dark:text-[#C4C7C5] max-w-md">
                {isFree
                  ? 'Bạn hiện đang sử dụng Gói Cơ bản miễn phí. Khi đăng ký nâng cấp các gói Plus hoặc Pro, toàn bộ hóa đơn điện tử sẽ hiển thị tại đây.'
                  : 'Chưa có hóa đơn nào được lưu lại trong tài khoản này.'}
              </p>
            </div>
          ) : (
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
                  {history.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                        {inv.invoiceCode || inv.id}
                      </td>
                      <td className="py-3 px-4 text-[#444746] dark:text-[#C4C7C5]">
                        {inv.paymentDate}
                      </td>
                      <td className="py-3 px-4 text-[#1F1F1F] dark:text-[#E3E3E3] font-medium">
                        {inv.planName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                        {inv.amount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[10px] font-bold border-none">
                          {inv.status === 'SUCCESS' ? t('badgeSuccess') : inv.status}
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
          )}
        </div>
      </div>

      {/* 4. Subscription Upgrade Modal */}
      <SubscriptionPlansModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccessToast={onSuccessToast}
      />
    </div>
  );
}
