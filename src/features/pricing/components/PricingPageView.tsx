'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PricingHeader } from './PricingHeader';
import { PricingHero } from './PricingHero';
import { PricingCards } from './PricingCards';
import { PricingComparisonTable } from './PricingComparisonTable';
import { PricingFaq } from './PricingFaq';
import { VietQrCheckoutModal } from './VietQrCheckoutModal';

export function PricingPageView() {
  const tFooter = useTranslations('pricing.footer');

  const [isYearly, setIsYearly] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    planCode: string;
    planName: string;
    price: number;
  }>({
    isOpen: false,
    planCode: 'PLUS',
    planName: 'Gói Nâng cao (Plus)',
    price: 99000,
  });

  const handleSelectPlan = (planCode: string, planName: string, price: number) => {
    setCheckoutModal({
      isOpen: true,
      planCode,
      planName,
      price,
    });
  };

  const handleCloseModal = () => {
    setCheckoutModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="bg-[#f8fafd] dark:bg-[#131314] text-slate-900 dark:text-[#e3e3e3] antialiased min-h-screen flex flex-col relative selection:bg-blue-600/20 dark:selection:bg-[#a8c7fa]/20 selection:text-blue-700 dark:selection:text-[#a8c7fa] transition-colors">
      {/* Header */}
      <PricingHeader />

      {/* Main Container */}
      <main className="w-full pt-24 pb-20 relative z-10 flex-1 flex flex-col items-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          {/* Hero Section with Status card & toggle */}
          <PricingHero isYearly={isYearly} onToggleBilling={setIsYearly} />

          {/* 4 Bento Pricing Cards */}
          <PricingCards isYearly={isYearly} onSelectPlan={handleSelectPlan} />

          {/* Detailed Feature Comparison Table */}
          <PricingComparisonTable />

          {/* FAQ Accordion */}
          <PricingFaq />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-[#3c4043] bg-white dark:bg-[#131314] relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <img
              src="/logo-full.png"
              alt="ILMS Logo"
              className="h-6 w-auto object-contain opacity-80"
            />
            <p className="text-xs text-slate-500 dark:text-[#8e918f]">
              {tFooter('copyright')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-[#8e918f]">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043]">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[14px]">
                verified_user
              </span>
              <span>{tFooter('soc2')}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043]">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[14px]">
                lock
              </span>
              <span>{tFooter('ssl')}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* VietQR Checkout Modal */}
      <VietQrCheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={handleCloseModal}
        planCode={checkoutModal.planCode}
        planName={checkoutModal.planName}
        price={checkoutModal.price}
        isYearly={isYearly}
      />
    </div>
  );
}
