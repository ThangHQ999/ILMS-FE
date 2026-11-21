'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/features/auth';
import { useMySubscription, useSubscriptionPlans } from '@/features/settings';

interface PricingCardsProps {
  isYearly: boolean;
  onSelectPlan: (
    planCode: string,
    planName: string,
    price: number,
    planId?: string
  ) => void;
}

export function PricingCards({ isYearly, onSelectPlan }: PricingCardsProps) {
  const t = useTranslations('pricing.cards');
  const { data: user } = useCurrentUser();
  const { data: subscription } = useMySubscription();
  const { data: plans = [] } = useSubscriptionPlans();

  const currentPlanCode = user
    ? (subscription?.planCode || 'FREE').toUpperCase()
    : null;

  const billingUnit = isYearly ? t('yearlyUnit') : t('monthlyUnit');

  const plusPlan = plans.find((p) => p.code === 'PLUS');
  const proPlan = plans.find((p) => p.code === 'PRO');
  const enterprisePlan = plans.find((p) => p.code === 'ENTERPRISE');

  const plusPrice = isYearly
    ? plusPlan?.yearlyPrice ?? 79000
    : plusPlan?.price ?? 99000;
  const proPrice = isYearly
    ? proPlan?.yearlyPrice ?? 159000
    : proPlan?.price ?? 199000;
  const enterprisePrice = isYearly
    ? enterprisePlan?.yearlyPrice ?? 399000
    : enterprisePlan?.price ?? 499000;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch w-full">
      {/* CARD 1: CƠ BẢN */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1f20] p-6 flex flex-col justify-between border border-slate-200 dark:border-[#3c4043] transition-colors">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#282a2c] text-slate-500 dark:text-[#8e918f] border border-slate-200 dark:border-[#3c4043]">
              {t('free.badge')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e3e3]">
            {t('free.name')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#c4c7c5] mt-1.5 min-h-[32px]">
            {t('free.description')}
          </p>

          <div className="my-5 pb-5 border-b border-slate-200 dark:border-[#3c4043] flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-[#e3e3e3] font-mono">
              0₫
            </span>
            <span className="text-xs text-slate-500 dark:text-[#8e918f] font-normal">
              {t('lifetimeUnit')}
            </span>
          </div>

          <ul className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-[#c4c7c5]">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>1 GB</strong> dung lượng lưu trữ cloud</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span>Tối đa <strong>3</strong> khóa học song song</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>20 lượt</strong> hỏi Trợ lý AI / ngày</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span>Tạo <strong>5 đồ thị</strong> tri thức</span>
            </li>
            <li className="flex items-start gap-2 text-slate-400 dark:text-[#8e918f]">
              <span className="material-symbols-outlined text-slate-400 dark:text-[#8e918f] text-[17px] shrink-0">
                close
              </span>
              <span>Không có tạo bài kiểm tra tự động</span>
            </li>
          </ul>
        </div>

        <button
          className={`mt-6 w-full py-2.5 px-4 rounded-full text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
            currentPlanCode === 'FREE'
              ? 'bg-slate-100 dark:bg-[#282a2c] text-slate-400 dark:text-[#8e918f] cursor-not-allowed border-slate-200 dark:border-[#3c4043]'
              : 'bg-slate-100 dark:bg-[#282a2c] text-slate-500 dark:text-[#8e918f] cursor-default border-slate-200 dark:border-[#3c4043]'
          }`}
          disabled
          type="button"
        >
          {currentPlanCode === 'FREE' ? t('currentPlanBtn') : t('freePlanBtn')}
        </button>
      </div>

      {/* CARD 2: PLUS (ACTIVE / RECOMMENDED) */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1f20] p-6 flex flex-col justify-between border-2 border-blue-600 dark:border-[#a8c7fa] relative transition-colors shadow-sm">
        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-blue-600 text-white dark:bg-[#a8c7fa] dark:text-[#131314] font-semibold text-[10px] tracking-wide uppercase shadow-xs">
          {t('recommendedBadge')}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 mt-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#a8c7fa]/15 dark:text-[#a8c7fa] dark:border-[#a8c7fa]/30">
              {t('plus.badge')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e3e3]">
            {t('plus.name')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#c4c7c5] mt-1.5 min-h-[32px]">
            {t('plus.description')}
          </p>

          <div className="my-5 pb-5 border-b border-slate-200 dark:border-[#3c4043] flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-[#e3e3e3] font-mono">
              {new Intl.NumberFormat('vi-VN').format(plusPrice)}₫
            </span>
            <span className="text-xs text-slate-500 dark:text-[#8e918f] font-normal">
              {billingUnit}
            </span>
          </div>

          <ul className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-[#c4c7c5]">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>15 GB</strong> lưu trữ tài liệu &amp; video HD</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span>Tạo tối đa <strong>15</strong> khóa học</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>300 lượt</strong> hỏi AI Socratic / ngày</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>30 Đồ thị</strong> tri thức tương tác</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span>Tự động tạo Quiz từ PDF, Slide</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() =>
            onSelectPlan(
              'PLUS',
              plusPlan?.name || 'Gói Nâng cao (Plus)',
              plusPrice,
              plusPlan?.id
            )
          }
          className={`mt-6 w-full py-2.5 px-4 rounded-full font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            currentPlanCode === 'PLUS'
              ? 'bg-slate-100 dark:bg-[#282a2c] text-slate-400 dark:text-[#8e918f] cursor-not-allowed border border-slate-200 dark:border-[#3c4043]'
              : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#a8c7fa] dark:hover:bg-[#b9d5fb] dark:text-[#00325b]'
          }`}
          disabled={currentPlanCode === 'PLUS'}
          type="button"
        >
          <span>{currentPlanCode === 'PLUS' ? t('currentPlanBtn') : t('upgradePlusBtn')}</span>
          {currentPlanCode !== 'PLUS' && (
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          )}
        </button>
      </div>

      {/* CARD 3: PRO */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1f20] p-6 flex flex-col justify-between border border-slate-200 dark:border-[#3c4043] hover:border-slate-300 dark:hover:border-[#444746] transition-colors">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#282a2c] text-slate-700 dark:text-[#c4c7c5] border border-slate-200 dark:border-[#3c4043]">
              {t('pro.badge')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e3e3]">
            {t('pro.name')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#c4c7c5] mt-1.5 min-h-[32px]">
            {t('pro.description')}
          </p>

          <div className="my-5 pb-5 border-b border-slate-200 dark:border-[#3c4043] flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-[#e3e3e3] font-mono">
              {new Intl.NumberFormat('vi-VN').format(proPrice)}₫
            </span>
            <span className="text-xs text-slate-500 dark:text-[#8e918f] font-normal">
              {billingUnit}
            </span>
          </div>

          <ul className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-[#c4c7c5]">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>50 GB</strong> dung lượng lưu trữ SSD</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span>Quản lý <strong>50 khóa học</strong> &amp; nhóm</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>1.000 lượt</strong> AI Deep Reasoning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>150 Đồ thị</strong> tri thức &amp; Vector Search</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span>Chấm điểm tự luận tự động bằng AI</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() =>
            onSelectPlan(
              'PRO',
              proPlan?.name || 'Gói Pro',
              proPrice,
              proPlan?.id
            )
          }
          className={`mt-6 w-full py-2.5 px-4 rounded-full text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            currentPlanCode === 'PRO'
              ? 'bg-slate-100 dark:bg-[#282a2c] text-slate-400 dark:text-[#8e918f] cursor-not-allowed border-slate-200 dark:border-[#3c4043]'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#282a2c] dark:hover:bg-[#323639] text-slate-900 dark:text-[#e3e3e3] border-slate-200 dark:border-[#3c4043]'
          }`}
          disabled={currentPlanCode === 'PRO'}
          type="button"
        >
          <span>{currentPlanCode === 'PRO' ? t('currentPlanBtn') : t('chooseProBtn')}</span>
        </button>
      </div>

      {/* CARD 4: ENTERPRISE */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1f20] p-6 flex flex-col justify-between border border-slate-200 dark:border-[#3c4043] hover:border-slate-300 dark:hover:border-[#444746] transition-colors">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#282a2c] text-slate-700 dark:text-[#c4c7c5] border border-slate-200 dark:border-[#3c4043]">
              {t('enterprise.badge')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e3e3]">
            {t('enterprise.name')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#c4c7c5] mt-1.5 min-h-[32px]">
            {t('enterprise.description')}
          </p>

          <div className="my-5 pb-5 border-b border-slate-200 dark:border-[#3c4043] flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-[#e3e3e3] font-mono">
              {new Intl.NumberFormat('vi-VN').format(enterprisePrice)}₫
            </span>
            <span className="text-xs text-slate-500 dark:text-[#8e918f] font-normal">
              {billingUnit}
            </span>
          </div>

          <ul className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-[#c4c7c5]">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>200 GB+</strong> lưu trữ chuyên dụng</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>Không giới hạn</strong> khóa học &amp; sinh viên</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span><strong>Không giới hạn</strong> AI Socratic</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span>Tùy biến tên miền riêng &amp; Logo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[17px] shrink-0">
                check
              </span>
              <span>Hỗ trợ SLA 99.9% 24/7</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() =>
            onSelectPlan(
              'ENTERPRISE',
              enterprisePlan?.name || 'Gói Doanh nghiệp',
              enterprisePrice,
              enterprisePlan?.id
            )
          }
          className={`mt-6 w-full py-2.5 px-4 rounded-full text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            currentPlanCode === 'ENTERPRISE'
              ? 'bg-slate-100 dark:bg-[#282a2c] text-slate-400 dark:text-[#8e918f] cursor-not-allowed border-slate-200 dark:border-[#3c4043]'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#282a2c] dark:hover:bg-[#323639] text-blue-600 dark:text-[#a8c7fa] border-slate-200 dark:border-[#3c4043]'
          }`}
          disabled={currentPlanCode === 'ENTERPRISE'}
          type="button"
        >
          <span>{currentPlanCode === 'ENTERPRISE' ? t('currentPlanBtn') : t('chooseEnterpriseBtn')}</span>
        </button>
      </div>
    </section>
  );
}
