'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { buildLoginRedirectUrl } from '@/lib/auth-redirect';
import { PublicHeader, PublicMinimalFooter } from '@/components/shared';
import { PricingHero } from './PricingHero';
import { PricingCards } from './PricingCards';
import { PricingComparisonTable } from './PricingComparisonTable';
import { PricingFaq } from './PricingFaq';
import { PricingAuthPromptModal } from './PricingAuthPromptModal';
import { VietQrCheckoutModal } from './VietQrCheckoutModal';

export function PricingPageView() {
  const router = useRouter();
  const { data: user } = useCurrentUser();

  const [isYearly, setIsYearly] = useState(false);
  const [authPromptModal, setAuthPromptModal] = useState<{
    isOpen: boolean;
    planName: string;
  }>({
    isOpen: false,
    planName: '',
  });
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
    if (!user) {
      setAuthPromptModal({
        isOpen: true,
        planName,
      });
      return;
    }
    setCheckoutModal({
      isOpen: true,
      planCode,
      planName,
      price,
    });
  };

  const handleConfirmAuthRedirect = () => {
    setAuthPromptModal((prev) => ({ ...prev, isOpen: false }));
    router.push(buildLoginRedirectUrl('/pricing'));
  };

  const handleCloseAuthPrompt = () => {
    setAuthPromptModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseModal = () => {
    setCheckoutModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="bg-[#f8fafd] dark:bg-[#131314] text-slate-900 dark:text-[#e3e3e3] antialiased min-h-screen flex flex-col relative selection:bg-blue-600/20 dark:selection:bg-[#a8c7fa]/20 selection:text-blue-700 dark:selection:text-[#a8c7fa] transition-colors">
      {/* Header */}
      <PublicHeader />

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
      <PublicMinimalFooter />

      {/* Auth Prompt Modal */}
      <PricingAuthPromptModal
        isOpen={authPromptModal.isOpen}
        planName={authPromptModal.planName}
        onConfirm={handleConfirmAuthRedirect}
        onClose={handleCloseAuthPrompt}
      />

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
