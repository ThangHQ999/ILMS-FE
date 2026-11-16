'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSubscribePlan } from '@/features/settings';

interface VietQrCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planCode: string;
  planName: string;
  price: number;
  isYearly: boolean;
}

export function VietQrCheckoutModal({
  isOpen,
  onClose,
  planCode,
  planName,
  price,
  isYearly,
}: VietQrCheckoutModalProps) {
  const t = useTranslations('pricing.modal');
  const [step, setStep] = useState<1 | 2>(2); // Default to Step 2 for instant VietQR scanning
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo'>('vietqr');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(14 * 60 + 59);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const subscribeMutation = useSubscribePlan();

  // Reset timer and step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(2);
      setSecondsRemaining(14 * 60 + 59);
      setIsSuccess(false);
      setCopiedField(null);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || secondsRemaining <= 0 || isSuccess) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsRemaining, isSuccess]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price) + '₫';
  const originalPriceNumber = isYearly ? Math.round(price / 0.8) : price;
  const formattedOriginalPrice = new Intl.NumberFormat('vi-VN').format(originalPriceNumber) + '₫';
  const transferCode = `ILMS ${planCode.toUpperCase()} 8492`;

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleConfirmPayment = async () => {
    try {
      // QUY TẮC CỐT LÕI: Backend hỗ trợ UUID v4 chuẩn hoặc Plan Code ("PRO", "PLUS", "ENTERPRISE")
      const planId = planCode || 'PRO';

      await subscribeMutation.mutateAsync({
        planId,
        paymentMethod: 'BANK_TRANSFER',
        autoRenew: true,
        notes: `Transfer note: ${transferCode}`,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch {
      // Handled by service
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[720px] bg-white dark:bg-[#1e1f20] rounded-3xl border border-slate-200 dark:border-[#444746] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header Flat */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#3c4043] flex items-center justify-between bg-slate-50 dark:bg-[#1e1f20]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[22px]">
              payments
            </span>
            <h3 className="font-bold text-slate-900 dark:text-[#e3e3e3] text-base sm:text-lg">
              {t('title', { planName })}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-[#282a2c] text-blue-700 dark:text-[#a8c7fa] border border-blue-200 dark:border-[#3c4043]">
              {isYearly ? t('badgeYearly', { planName }) : t('badgeMonthly', { planName })}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-[#8e918f] hover:text-slate-700 dark:hover:text-[#e3e3e3] hover:bg-slate-200 dark:hover:bg-[#282a2c] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body Wrapper */}
        <div className="p-6 overflow-y-auto">
          {/* Success State */}
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-[#e3e3e3]">
                {t('step2.successTitle')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#c4c7c5] max-w-md">
                {t('step2.successDesc', { planName })}
              </p>
            </div>
          ) : step === 1 ? (
            /* VIEW 1: CHỌN PHƯƠNG THỨC THANH TOÁN */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 flex flex-col gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#8e918f]">
                    {t('step1.badge')}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-[#e3e3e3]">
                    {t('step1.title')}
                  </h4>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label
                    onClick={() => setPaymentMethod('vietqr')}
                    className={`relative flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'vietqr'
                        ? 'border-blue-600 bg-blue-50/70 dark:border-[#a8c7fa] dark:bg-[#a8c7fa]/10'
                        : 'border-slate-200 dark:border-[#3c4043] bg-white dark:bg-[#282a2c]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'vietqr'}
                        onChange={() => setPaymentMethod('vietqr')}
                        className="accent-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900 dark:text-[#e3e3e3]">
                          {t('step1.vietqr')}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-[#c4c7c5]">
                          {t('step1.vietqrDesc')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 dark:text-[#a8c7fa] bg-blue-100 dark:bg-[#1e1f20] px-2 py-0.5 rounded-full border border-blue-200 dark:border-[#3c4043]">
                      {t('step1.auto247')}
                    </span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('momo')}
                    className={`relative flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'momo'
                        ? 'border-blue-600 bg-blue-50/70 dark:border-[#a8c7fa] dark:bg-[#a8c7fa]/10'
                        : 'border-slate-200 dark:border-[#3c4043] bg-white dark:bg-[#282a2c]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'momo'}
                        onChange={() => setPaymentMethod('momo')}
                        className="accent-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900 dark:text-[#e3e3e3]">
                          {t('step1.momo')}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-[#8e918f]">
                          {t('step1.momoDesc')}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 dark:text-[#8e918f] text-[18px]">
                      account_balance_wallet
                    </span>
                  </label>
                </div>
              </div>

              {/* Order summary */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-[#282a2c] rounded-2xl p-5 border border-slate-200 dark:border-[#3c4043] flex flex-col justify-between">
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8e918f]">
                    {t('step1.orderSummary')}
                  </span>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043]">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-[#e3e3e3]">
                        {planName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-[#8e918f]">
                        {isYearly ? '1 Năm' : '1 Tháng'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-[#3c4043] text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-[#c4c7c5]">
                      <span>{t('step1.listedPrice')}</span>
                      <span className="font-mono text-slate-900 dark:text-[#e3e3e3]">
                        {formattedOriginalPrice}
                      </span>
                    </div>
                    {isYearly && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>{t('step1.discount')}</span>
                        <span className="font-mono">
                          -
                          {new Intl.NumberFormat('vi-VN').format(originalPriceNumber - price)}
                          ₫
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 dark:border-[#3c4043] flex justify-between items-center font-bold">
                      <span className="text-slate-900 dark:text-[#e3e3e3]">{t('step1.total')}</span>
                      <span className="font-mono text-base text-blue-700 dark:text-[#a8c7fa]">
                        {formattedPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="mt-4 w-full py-2.5 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#a8c7fa] dark:hover:bg-[#b9d5fb] dark:text-[#00325b] font-semibold text-xs transition-colors cursor-pointer"
                  type="button"
                >
                  {t('step1.continueBtn')}
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 2: KHUNG QUÉT MÃ VIETQR TỰ ĐỘNG - MATERIAL FLAT DESIGN */
            <div className="flex flex-col gap-5">
              {/* Header Status & switch method */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-[#3c4043] gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#c4c7c5] hover:text-blue-600 dark:hover:text-[#a8c7fa] transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>{t('step2.backToStep1')}</span>
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#282a2c] border border-slate-200 dark:border-[#3c4043]">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#a8c7fa] animate-pulse" />
                  <span className="text-xs text-slate-600 dark:text-[#c4c7c5] font-medium">
                    {t('step2.waitingStatus')}
                  </span>
                  <span className="text-xs font-mono text-slate-900 dark:text-[#e3e3e3] font-bold ml-1 px-1.5 py-0.5 rounded bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043]">
                    {timerStr}
                  </span>
                </div>
              </div>

              {/* Grid 2 Column: QR code & Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Left: Clean QR Code Card */}
                <div className="md:col-span-5 flex flex-col items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#282a2c] border border-slate-200 dark:border-[#3c4043]">
                  <div className="w-full flex flex-col items-center">
                    <div className="p-3 bg-white rounded-xl flex flex-col items-center shadow-md w-full max-w-[210px]">
                      {/* Header VietQR/Napas MB Bank */}
                      <div className="w-full flex items-center justify-between pb-2 mb-1.5 border-b border-slate-200">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[11px] tracking-tight text-blue-700">
                            VietQR
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            | NAPAS 247
                          </span>
                        </div>
                        <div className="text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded border border-red-200">
                          MB BANK
                        </div>
                      </div>

                      {/* QR Code Vector */}
                      <div className="py-1">
                        <svg
                          className="w-40 h-40"
                          fill="none"
                          viewBox="0 0 160 160"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect fill="#FFFFFF" height="160" width="160" />
                          {/* Corner Markers */}
                          <rect fill="#131314" height="36" rx="2" width="36" x="10" y="10" />
                          <rect fill="#FFFFFF" height="24" rx="1" width="24" x="16" y="16" />
                          <rect fill="#131314" height="12" rx="1" width="12" x="22" y="22" />

                          <rect fill="#131314" height="36" rx="2" width="36" x="114" y="10" />
                          <rect fill="#FFFFFF" height="24" rx="1" width="24" x="120" y="16" />
                          <rect fill="#131314" height="12" rx="1" width="12" x="126" y="22" />

                          <rect fill="#131314" height="36" rx="2" width="36" x="10" y="114" />
                          <rect fill="#FFFFFF" height="24" rx="1" width="24" x="16" y="120" />
                          <rect fill="#131314" height="12" rx="1" width="12" x="22" y="126" />

                          {/* Pattern Data Points */}
                          <g fill="#131314">
                            <rect height="6" width="6" x="52" y="14" />
                            <rect height="6" width="6" x="64" y="14" />
                            <rect height="6" width="6" x="76" y="14" />
                            <rect height="6" width="6" x="94" y="14" />
                            <rect height="6" width="6" x="58" y="24" />
                            <rect height="6" width="6" x="70" y="24" />
                            <rect height="6" width="6" x="88" y="24" />
                            <rect height="6" width="6" x="100" y="24" />
                            <rect height="6" width="6" x="52" y="34" />
                            <rect height="6" width="6" x="64" y="34" />
                            <rect height="6" width="6" x="82" y="34" />
                            <rect height="6" width="6" x="14" y="54" />
                            <rect height="6" width="6" x="26" y="54" />
                            <rect height="6" width="6" x="38" y="54" />
                            <rect height="6" width="6" x="50" y="54" />
                            <rect height="6" width="12" x="68" y="54" />
                            <rect height="6" width="6" x="86" y="54" />
                            <rect height="6" width="6" x="104" y="54" />
                            <rect height="6" width="6" x="122" y="54" />
                            <rect height="6" width="12" x="134" y="54" />
                            <rect height="6" width="12" x="14" y="66" />
                            <rect height="6" width="6" x="32" y="66" />
                            <rect height="6" width="6" x="44" y="66" />
                            <rect height="6" width="6" x="62" y="66" />
                            <rect height="6" width="12" x="80" y="66" />
                            <rect height="6" width="6" x="98" y="66" />
                            <rect height="6" width="6" x="110" y="66" />
                            <rect height="6" width="6" x="128" y="66" />
                            <rect height="6" width="6" x="140" y="66" />
                            {/* Center Logo Icon */}
                            <rect fill="#0b57d0" height="24" rx="4" width="24" x="68" y="68" />
                            <circle cx="80" cy="80" fill="#FFFFFF" r="6" />
                            {/* Bottom Pattern Data */}
                            <rect height="6" width="6" x="52" y="96" />
                            <rect height="6" width="6" x="64" y="96" />
                            <rect height="6" width="6" x="76" y="96" />
                            <rect height="6" width="6" x="94" y="96" />
                            <rect height="6" width="6" x="106" y="96" />
                            <rect height="6" width="6" x="124" y="96" />
                            <rect height="6" width="6" x="58" y="108" />
                            <rect height="6" width="6" x="76" y="108" />
                            <rect height="6" width="6" x="88" y="108" />
                            <rect height="6" width="6" x="100" y="108" />
                            <rect height="6" width="6" x="130" y="108" />
                            <rect height="6" width="6" x="52" y="126" />
                            <rect height="6" width="6" x="70" y="126" />
                            <rect height="6" width="6" x="88" y="126" />
                            <rect height="6" width="6" x="118" y="126" />
                            <rect height="6" width="6" x="136" y="126" />
                            <rect height="6" width="6" x="58" y="138" />
                            <rect height="6" width="6" x="82" y="138" />
                            <rect height="6" width="6" x="106" y="138" />
                            <rect height="6" width="6" x="124" y="138" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Transfer Information Details */}
                <div className="md:col-span-7 flex flex-col justify-between gap-3.5">
                  <div className="p-4 bg-slate-50 dark:bg-[#282a2c] rounded-2xl border border-slate-200 dark:border-[#3c4043] flex flex-col gap-2.5">
                    {/* Bank */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-[#3c4043] text-xs">
                      <span className="text-slate-500 dark:text-[#8e918f]">{t('step2.bank')}</span>
                      <span className="text-slate-900 dark:text-[#e3e3e3] font-semibold flex items-center gap-1">
                        <span className="text-red-500 font-bold">MB Bank</span> (Quân Đội)
                      </span>
                    </div>

                    {/* Account Holder */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-[#3c4043] text-xs">
                      <span className="text-slate-500 dark:text-[#8e918f]">
                        {t('step2.accountHolder')}
                      </span>
                      <span className="text-slate-900 dark:text-[#e3e3e3] font-semibold uppercase tracking-wide">
                        {t('step2.accountHolderName')}
                      </span>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-[#3c4043] text-xs">
                      <span className="text-slate-500 dark:text-[#8e918f]">
                        {t('step2.accountNumber')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700 dark:text-[#a8c7fa] font-mono font-bold text-sm tracking-wider">
                          0123456789
                        </span>
                        <button
                          onClick={() => copyToClipboard('0123456789', 'stk')}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#1e1f20] hover:bg-slate-100 dark:hover:bg-[#323639] text-slate-700 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3] transition-colors text-[11px] font-medium flex items-center gap-1 border border-slate-200 dark:border-[#3c4043] cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {copiedField === 'stk' ? 'done' : 'content_copy'}
                          </span>
                          <span>{copiedField === 'stk' ? t('step2.copied') : t('step2.copy')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-[#3c4043] text-xs">
                      <span className="text-slate-500 dark:text-[#8e918f]">{t('step2.amount')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-base">
                          {formattedPrice}
                        </span>
                        <button
                          onClick={() => copyToClipboard(String(price), 'price')}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#1e1f20] hover:bg-slate-100 dark:hover:bg-[#323639] text-slate-700 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3] transition-colors text-[11px] font-medium flex items-center gap-1 border border-slate-200 dark:border-[#3c4043] cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {copiedField === 'price' ? 'done' : 'content_copy'}
                          </span>
                          <span>{copiedField === 'price' ? t('step2.copied') : t('step2.copy')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Transfer Note */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] flex flex-col gap-1.5 mt-1">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e918f]">
                        {t('step2.transferNote')}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-700 dark:text-[#a8c7fa] text-sm tracking-wide">
                          {transferCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(transferCode, 'note')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-[#282a2c] hover:bg-blue-100 dark:hover:bg-[#323639] text-blue-700 dark:text-[#a8c7fa] text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-200 dark:border-[#3c4043] cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedField === 'note' ? 'done' : 'content_copy'}
                          </span>
                          <span>{copiedField === 'note' ? t('step2.copied') : t('step2.copy')}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Auto-activation note */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#282a2c] border border-slate-200 dark:border-[#3c4043] flex items-start gap-2.5 text-xs text-slate-600 dark:text-[#c4c7c5]">
                    <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[18px] shrink-0 mt-0.5">
                      verified
                    </span>
                    <span>{t('step2.autoNote')}</span>
                  </div>

                  {/* Bottom Action buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <button
                      onClick={() => setStep(1)}
                      className="w-full sm:w-2/5 py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#282a2c] dark:hover:bg-[#323639] text-slate-700 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3] text-xs font-semibold border border-slate-200 dark:border-[#3c4043] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                      <span>{t('step2.backToStep1')}</span>
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={subscribeMutation.isPending}
                      className="w-full sm:w-3/5 py-2.5 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#a8c7fa] dark:hover:bg-[#b9d5fb] dark:text-[#00325b] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {subscribeMutation.isPending ? 'hourglass_top' : 'check_circle'}
                      </span>
                      <span>
                        {subscribeMutation.isPending
                          ? t('step2.completingBtn')
                          : t('step2.completeBtn')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
