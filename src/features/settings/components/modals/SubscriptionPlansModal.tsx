'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSubscriptionPlans, useMySubscription, useSubscribePlan } from '../../hooks/useSubscriptions';
import type { SubscriptionPlan } from '../../schemas/subscription.schema';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: () => void;
}

export function SubscriptionPlansModal({
  isOpen,
  onClose,
  onSuccessToast,
}: SubscriptionPlansModalProps) {
  const t = useTranslations('settings');
  const { data: plans = [], isLoading: isLoadingPlans } = useSubscriptionPlans();
  const { data: currentSub } = useMySubscription();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-pro');
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'CREDIT_CARD'>('VNPAY');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);

  // QUY TẮC CỐT LÕI HỆ THỐNG: Mọi Entity ID trên Backend ILMS đều là UUID 36 ký tự.
  // Tự động gán selectedPlanId sang UUID thật lấy từ API /subscriptions/plans khi tải xong:
  useEffect(() => {
    if (plans.length > 0) {
      const targetPlan =
        plans.find((p) => p.code === 'PRO') ||
        plans.find((p) => p.code !== currentSub?.planCode) ||
        plans[0];
      if (
        targetPlan &&
        (!selectedPlanId ||
          selectedPlanId === 'plan-pro' ||
          !plans.some((p) => p.id === selectedPlanId))
      ) {
        setSelectedPlanId(targetPlan.id);
      }
    }
  }, [plans, currentSub]);

  const subscribeMutation = useSubscribePlan(() => {
    onSuccessToast?.();
    onClose();
  });

  if (!isOpen) return null;

  const handleSubscribe = () => {
    if (!selectedPlanId) return;
    subscribeMutation.mutate({
      planId: selectedPlanId,
      paymentMethod,
      autoRenew,
    });
  };

  const isPending = subscribeMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1F20] border-none max-w-5xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#282A2C] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Nâng cấp Gói Dịch vụ & Hạn mức AI
              </h2>
              <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                Chọn gói dịch vụ phù hợp để mở rộng dung lượng Cloud và tăng cường Trợ lý AI Socratic
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-[#282A2C] flex items-center justify-center text-slate-500 cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Plans Grid */}
        {isLoadingPlans ? (
          <div className="p-16 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan: SubscriptionPlan) => {
              const isSelected = selectedPlanId === plan.id;
              const isCurrent = currentSub?.planCode === plan.code;

              return (
                <div
                  key={plan.id}
                  onClick={() => !isCurrent && setSelectedPlanId(plan.id)}
                  className={`p-5 rounded-3xl flex flex-col justify-between transition-all relative border-2 ${
                    isSelected
                      ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-[#D3E3FD]/20 dark:bg-[#162B4D]/30 shadow-md'
                      : isCurrent
                      ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200/80 dark:border-[#282A2C] bg-white dark:bg-[#1E1F20] hover:border-slate-300 dark:hover:border-slate-600'
                  } ${isCurrent ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 right-4">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          plan.isPopular
                            ? 'bg-[#0B57D0] text-white'
                            : isCurrent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-[#282A2C] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isCurrent ? 'Gói hiện tại' : plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                        {plan.name}
                      </h3>
                      <p className="text-[11px] text-[#747775] dark:text-[#C4C7C5] line-clamp-2 mt-1">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="pt-2">
                      <span className="text-2xl font-black text-[#1F1F1F] dark:text-[#E3E3E3]">
                        {plan.price === 0 ? '0 đ' : `${plan.price.toLocaleString('vi-VN')} đ`}
                      </span>
                      <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                        {' '}/ {plan.billingCycle}
                      </span>
                    </div>

                    {/* Key Quota Highlights */}
                    <div className="py-2 flex flex-col gap-1.5 text-xs border-y border-slate-100 dark:border-[#282A2C]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#747775] dark:text-[#8E918F]">Dung lượng:</span>
                        <span className="font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                          {plan.maxStorageFormatted}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#747775] dark:text-[#8E918F]">AI Quota:</span>
                        <span className="font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                          {plan.aiDailyRequests} câu/ngày
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-1.5 text-xs text-[#444746] dark:text-[#C4C7C5]">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[16px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span className="text-[11px] leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Radio Select */}
                  <div className="pt-4 mt-auto">
                    {isCurrent ? (
                      <span className="w-full py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Đang sử dụng
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`w-full py-2 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B57D0] hover:bg-[#0842A0] text-white'
                            : 'bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3]'
                        }`}
                      >
                        {isSelected ? 'Đã chọn' : 'Chọn gói này'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment & Auto-Renew Options */}
        <div className="p-5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
              Phương thức thanh toán:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  { id: 'VNPAY', label: 'Cổng VNPAY' },
                  { id: 'MOMO', label: 'Ví MoMo' },
                  { id: 'BANK_TRANSFER', label: 'Chuyển khoản QR' },
                  { id: 'CREDIT_CARD', label: 'Thẻ Quốc tế' },
                ] as const
              ).map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-none cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F]'
                      : 'bg-white dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5]'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-[#444746] dark:text-[#C4C7C5] cursor-pointer self-start sm:self-auto">
            <input
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="w-4 h-4 accent-[#0B57D0]"
            />
            <span>Tự động gia hạn hàng tháng</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#282A2C]">
          <span className="text-xs text-[#747775] dark:text-[#8E918F]">
            Thanh toán an toàn bảo mật chuẩn SSL 256-bit • Có thể hủy gia hạn bất kỳ lúc nào
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-semibold cursor-pointer border-none"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSubscribe}
              className="px-6 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-bold transition-all border-none shadow-none flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang xử lý thanh toán...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">credit_card</span>
                  <span>Tiến hành Thanh toán</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
